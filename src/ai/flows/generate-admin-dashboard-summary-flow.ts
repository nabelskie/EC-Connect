'use server';
/**
 * @fileOverview Generates an operational summary for the admin dashboard.
 * Uses strict isolation and dynamic imports to prevent build errors on mobile.
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
 * Main wrapper function. Executes as a Server Action.
 */
export async function generateAdminDashboardSummary(
  input: GenerateAdminDashboardSummaryInput
): Promise<GenerateAdminDashboardSummaryOutput> {
  try {
    // Dynamic import prevents Genkit from being bundled in the client/mobile static output
    const { ai } = await import('@/ai/genkit');

    const prompt = ai.definePrompt({
      name: 'generateAdminDashboardSummaryPrompt',
      input: { schema: GenerateAdminDashboardSummaryInputSchema },
      output: { schema: GenerateAdminDashboardSummaryOutputSchema },
      prompt: `You are an operations analyst for ElderCare Connect, a community support system.
      
      Provide a concise, professional operational summary for an admin dashboard based on these metrics: 
      - Total Registered Users: {{{totalUsers}}}
      - Total Assistance Requests (All time): {{{totalRequests}}}
      - Completed Tasks: {{{completedTasks}}}
      - Currently Active Volunteers: {{{activeVolunteers}}}

      Identify a positive trend or a specific area of focus based on the numbers. Keep the summary under 3 sentences.`,
    });

    const { output } = await prompt(input);
    return output || { summary: "Dashboard data summary available." };
  } catch (error) {
    console.error("AI Generation Error:", error);
    return { 
      summary: `System Overview: ${input.totalUsers} Users registered, ${input.completedTasks} Tasks successfully completed.`
    };
  }
}
