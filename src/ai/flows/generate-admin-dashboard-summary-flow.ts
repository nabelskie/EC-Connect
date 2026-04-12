
/**
 * @fileOverview This file implements a Genkit flow to generate a summary of key operational insights
 * for the admin dashboard based on provided system metrics.
 */

import { z } from 'zod';

// Use Zod directly for schema definitions to remain browser-compatible
const GenerateAdminDashboardSummaryInputSchema = z.object({
  totalUsers: z.number(),
  totalRequests: z.number(),
  activeVolunteers: z.number(),
  completedTasks: z.number(),
  taskTypeCounts: z.record(z.string(), z.number()),
});
export type GenerateAdminDashboardSummaryInput = z.infer<typeof GenerateAdminDashboardSummaryInputSchema>;

const GenerateAdminDashboardSummaryOutputSchema = z.object({
  summary: z.string(),
});
export type GenerateAdminDashboardSummaryOutput = z.infer<typeof GenerateAdminDashboardSummaryOutputSchema>;

/**
 * Wrapper function for the AI flow.
 * Note: AI generation requires a server. In a static export (APK), 
 * it returns a basic data summary as a fallback.
 */
export async function generateAdminDashboardSummary(
  input: GenerateAdminDashboardSummaryInput
): Promise<GenerateAdminDashboardSummaryOutput> {
  // Check if we are in the browser (Mobile App / Static Export context)
  if (typeof window !== 'undefined') {
    return { 
      summary: `System Overview: ${input.totalUsers} users, ${input.totalRequests} requests, and ${input.completedTasks} completed tasks.`
    };
  }

  // Server-only block
  try {
    // Dynamic import inside the function to ensure the client bundle never sees Genkit code
    const { ai } = await import('@/ai/genkit');

    const prompt = ai.definePrompt({
      name: 'generateAdminDashboardSummaryPrompt',
      input: { schema: GenerateAdminDashboardSummaryInputSchema },
      output: { schema: GenerateAdminDashboardSummaryOutputSchema },
      prompt: `Provide a concise operational summary for an admin dashboard based on these metrics: 
      Total Users: {{{totalUsers}}}, Total Requests: {{{totalRequests}}}, Completed: {{{completedTasks}}}.`,
    });

    const { output } = await prompt(input);
    return output || { summary: "Dashboard data summary available." };
  } catch (error) {
    return { 
      summary: `Quick Stats: ${input.totalUsers} Users, ${input.completedTasks} Tasks Completed.`
    };
  }
}
