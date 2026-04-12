/**
 * @fileOverview This file implements a Genkit flow to generate a summary of key operational insights
 * for the admin dashboard based on provided system metrics.
 */

import {z} from 'genkit';

const GenerateAdminDashboardSummaryInputSchema = z.object({
  totalUsers: z.number().describe('Total number of registered users.'),
  totalRequests: z.number().describe('Total number of requests.'),
  activeVolunteers: z.number().describe('Number of active volunteers.'),
  completedTasks: z.number().describe('Total number of completed tasks.'),
  taskTypeCounts: z.record(z.string(), z.number()).describe('Counts for each task type.'),
});
export type GenerateAdminDashboardSummaryInput = z.infer<typeof GenerateAdminDashboardSummaryInputSchema>;

const GenerateAdminDashboardSummaryOutputSchema = z.object({
  summary: z.string().describe('Operational summary for the admin dashboard.'),
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
      summary: `System Overview: ${input.totalUsers} users registered, ${input.totalRequests} total requests, and ${input.completedTasks} tasks completed successfully.`
    };
  }

  // We use a dynamic import here to prevent Webpack from trying to bundle 
  // the Genkit engine into the mobile app's client-side code.
  try {
    const { ai } = await import('@/ai/genkit');

    const prompt = ai.definePrompt({
      name: 'generateAdminDashboardSummaryPrompt',
      input: {schema: GenerateAdminDashboardSummaryInputSchema},
      output: {schema: GenerateAdminDashboardSummaryOutputSchema},
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
