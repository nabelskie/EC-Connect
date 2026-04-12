
/**
 * @fileOverview Generates an operational summary for the admin dashboard.
 * Uses strict isolation to prevent build errors on mobile.
 */

import { z } from 'zod';

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
 * Main wrapper function. Safely handles browser/mobile environments.
 */
export async function generateAdminDashboardSummary(
  input: GenerateAdminDashboardSummaryInput
): Promise<GenerateAdminDashboardSummaryOutput> {
  if (typeof window !== 'undefined') {
    return { 
      summary: `System Overview: ${input.totalUsers} users, ${input.totalRequests} requests, and ${input.completedTasks} completed tasks.`
    };
  }

  try {
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
