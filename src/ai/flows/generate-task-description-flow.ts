
/**
 * @fileOverview A flow that helps elderly users write clear descriptions for assistance requests.
 * Uses strict isolation to prevent build errors on mobile.
 */

import { z } from 'zod';

const GenerateTaskDescriptionInputSchema = z.object({
  taskType: z.enum(['Groceries', 'Transportation', 'Tech Support']),
  initialDescription: z.string(),
  location: z.string().optional(),
  urgencyLevel: z.enum(['Low', 'Medium', 'High']).optional(),
});

export type GenerateTaskDescriptionInput = z.infer<typeof GenerateTaskDescriptionInputSchema>;

const GenerateTaskDescriptionOutputSchema = z.object({
  generatedDescription: z.string(),
});

export type GenerateTaskDescriptionOutput = z.infer<typeof GenerateTaskDescriptionOutputSchema>;

/**
 * Main wrapper function. Safely handles browser/mobile environments.
 */
export async function generateTaskDescription(
  input: GenerateTaskDescriptionInput
): Promise<GenerateTaskDescriptionOutput> {
  // CRITICAL: Immediately exit if running in a browser/mobile environment
  if (typeof window !== 'undefined') {
    return { generatedDescription: input.initialDescription };
  }

  try {
    // Dynamic import inside a condition hides the code from the static bundle analyzer
    const { ai } = await import('@/ai/genkit');
    
    const prompt = ai.definePrompt({
      name: 'generateTaskDescriptionPrompt',
      input: { schema: GenerateTaskDescriptionInputSchema },
      output: { schema: GenerateTaskDescriptionOutputSchema },
      prompt: `You are an AI assistant helping elderly users. 
      Expand on this: {{{initialDescription}}}. 
      Type: {{{taskType}}}. Location: {{{location}}}. Urgency: {{{urgencyLevel}}}.`,
    });

    const { output } = await prompt(input);
    return output || { generatedDescription: input.initialDescription };
  } catch (error) {
    return { generatedDescription: input.initialDescription };
  }
}
