/**
 * @fileOverview A Genkit flow that helps elderly users or caregivers write clear and comprehensive descriptions for assistance requests.
 *
 * - generateTaskDescription - A function that handles the generation of task descriptions.
 * - GenerateTaskDescriptionInput - The input type for the generateTaskDescription function.
 * - GenerateTaskDescriptionOutput - The return type for the generateTaskDescription function.
 */

import {z} from 'genkit';

const GenerateTaskDescriptionInputSchema = z.object({
  taskType: z
    .enum(['Groceries', 'Transportation', 'Tech Support'])
    .describe('The type of assistance task.'),
  initialDescription: z
    .string()
    .describe('A brief initial description of the task from the user.'),
  location: z.string().optional().describe('The location relevant to the task, if any.'),
  urgencyLevel: z
    .enum(['Low', 'Medium', 'High'])
    .optional()
    .describe('The urgency level of the task.'),
});
export type GenerateTaskDescriptionInput = z.infer<
  typeof GenerateTaskDescriptionInputSchema
>;

const GenerateTaskDescriptionOutputSchema = z.object({
  generatedDescription: z
    .string()
    .describe(
      'A comprehensive and clear description for the assistance request, ready for volunteers to understand.'
    ),
});
export type GenerateTaskDescriptionOutput = z.infer<
  typeof GenerateTaskDescriptionOutputSchema
>;

/**
 * Wrapper function for the AI flow.
 * Note: AI generation requires a server. In a static export (APK), 
 * it returns the original description as a fallback.
 */
export async function generateTaskDescription(
  input: GenerateTaskDescriptionInput
): Promise<GenerateTaskDescriptionOutput> {
  // Check if we are in the browser (Mobile App / Static Export context)
  if (typeof window !== 'undefined') {
    return { generatedDescription: input.initialDescription };
  }

  // We use a dynamic import here to prevent Webpack from trying to bundle 
  // the Genkit engine into the mobile app's client-side code.
  try {
    const { ai } = await import('@/ai/genkit');
    
    const prompt = ai.definePrompt({
      name: 'generateTaskDescriptionPrompt',
      input: {schema: GenerateTaskDescriptionInputSchema},
      output: {schema: GenerateTaskDescriptionOutputSchema},
      prompt: `You are an AI assistant designed to help elderly users or caregivers write clear and comprehensive descriptions for assistance requests to volunteers.
Expand on the initial description provided: {{{initialDescription}}}. 
Task Type: {{{taskType}}}. 
Location: {{{location}}}. 
Urgency: {{{urgencyLevel}}}.`,
    });

    const { output } = await prompt(input);
    return output || { generatedDescription: input.initialDescription };
  } catch (error) {
    console.error("AI Generation Error:", error);
    return { generatedDescription: input.initialDescription };
  }
}
