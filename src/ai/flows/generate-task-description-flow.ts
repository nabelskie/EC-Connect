/**
 * @fileOverview A Genkit flow that helps elderly users or caregivers write clear and comprehensive descriptions for assistance requests.
 */

import { z } from 'zod';

// Use Zod directly for schema definitions to remain browser-compatible
const GenerateTaskDescriptionInputSchema = z.object({
  taskType: z.enum(['Groceries', 'Transportation', 'Tech Support']),
  initialDescription: z.string(),
  location: z.string().optional(),
  urgencyLevel: z.enum(['Low', 'Medium', 'High']).optional(),
});
export type GenerateTaskDescriptionInput = z.infer<
  typeof GenerateTaskDescriptionInputSchema
>;

const GenerateTaskDescriptionOutputSchema = z.object({
  generatedDescription: z.string(),
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

  // Server-only block
  try {
    // Dynamic import inside the function to ensure the client bundle never sees Genkit
    const { ai } = await import('@/ai/genkit');
    
    const prompt = ai.definePrompt({
      name: 'generateTaskDescriptionPrompt',
      input: { schema: GenerateTaskDescriptionInputSchema },
      output: { schema: GenerateTaskDescriptionOutputSchema },
      prompt: `You are an AI assistant designed to help elderly users or caregivers write clear and comprehensive descriptions for assistance requests.
Expand on the initial description provided: {{{initialDescription}}}. 
Task Type: {{{taskType}}}. 
Location: {{{location}}}. 
Urgency: {{{urgencyLevel}}}.`,
    });

    const { output } = await prompt(input);
    return output || { generatedDescription: input.initialDescription };
  } catch (error) {
    return { generatedDescription: input.initialDescription };
  }
}
