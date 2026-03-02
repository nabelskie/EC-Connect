'use server';
/**
 * @fileOverview This file implements a Genkit flow to generate a summary of key operational insights
 * for the admin dashboard based on provided system metrics.
 *
 * - generateAdminDashboardSummary - A function that handles the generation of the admin dashboard summary.
 * - GenerateAdminDashboardSummaryInput - The input type for the generateAdminDashboardSummary function.
 * - GenerateAdminDashboardSummaryOutput - The return type for the generateAdminDashboardSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAdminDashboardSummaryInputSchema = z.object({
  totalUsers: z.number().describe('Total number of registered users in the system.'),
  totalRequests: z.number().describe('Total number of assistance requests created.'),
  activeVolunteers: z.number().describe('Number of volunteers who have accepted at least one task recently.'),
  completedTasks: z.number().describe('Total number of tasks that have been completed.'),
  taskTypeCounts: z
    .record(z.string(), z.number())
    .describe('An object containing counts for each task type, e.g., { "Grocery": 15, "Transport": 10 }.'),
});
export type GenerateAdminDashboardSummaryInput = z.infer<typeof GenerateAdminDashboardSummaryInputSchema>;

const GenerateAdminDashboardSummaryOutputSchema = z.object({
  summary: z.string().describe('A comprehensive summary of the system performance and key operational insights for the admin dashboard.'),
});
export type GenerateAdminDashboardSummaryOutput = z.infer<typeof GenerateAdminDashboardSummaryOutputSchema>;

export async function generateAdminDashboardSummary(
  input: GenerateAdminDashboardSummaryInput
): Promise<GenerateAdminDashboardSummaryOutput> {
  return generateAdminDashboardSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAdminDashboardSummaryPrompt',
  input: {schema: GenerateAdminDashboardSummaryInputSchema},
  output: {schema: GenerateAdminDashboardSummaryOutputSchema},
  prompt: `You are an intelligent assistant designed to provide operational insights for an admin dashboard. Analyze the following data to provide a concise and actionable summary of system performance, key trends, and potential areas for decision-making.

Data provided:
- Total Users: {{{totalUsers}}}
- Total Requests: {{{totalRequests}}}
- Active Volunteers: {{{activeVolunteers}}}
- Completed Tasks: {{{completedTasks}}}
- Task Type Counts: {{{json taskTypeCounts}}}

Focus on identifying:
1. Overall system health and activity.
2. Trending task types.
3. Volunteer engagement.
4. Any other notable observations or recommendations.

Your summary should be clear, comprehensive, and suitable for quick understanding by an administrator.`,
});

const generateAdminDashboardSummaryFlow = ai.defineFlow(
  {
    name: 'generateAdminDashboardSummaryFlow',
    inputSchema: GenerateAdminDashboardSummaryInputSchema,
    outputSchema: GenerateAdminDashboardSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
