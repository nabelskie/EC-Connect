'use server';
/**
 * @fileOverview A flow that helps elderly users write clear descriptions for assistance requests.
 * Uses strict isolation and dynamic imports to prevent build errors on mobile.
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
 * Main wrapper function. Executes as a Server Action.
 */
export async function generateTaskDescription(
  input: GenerateTaskDescriptionInput
): Promise<GenerateTaskDescriptionOutput> {
  try {
    // Dynamic import hides Genkit from the static bundle analyzer for mobile builds
    const { ai } = await import('@/ai/genkit');
    
    const prompt = ai.definePrompt({
      name: 'generateTaskDescriptionPrompt',
      input: { schema: GenerateTaskDescriptionInputSchema },
      output: { schema: GenerateTaskDescriptionOutputSchema },
      prompt: `You are an AI assistant helping elderly users at Politeknik Kuching Sarawak.
      
      Take the following short description and expand it into a clear, polite, and detailed request that a student volunteer can easily understand and act upon.
      
      Category: {{{taskType}}}
      Draft: {{{initialDescription}}}
      Location: {{{location}}}
      Urgency: {{{urgencyLevel}}}

      Rules:
      1. Stay focused on the original request.
      2. Keep the tone respectful and clear.
      3. If specific items or brands are mentioned, keep them in the description.
      4. The output should be the full expanded description text only.`,
    });

    const { output } = await prompt(input);
    return output || { generatedDescription: input.initialDescription };
  } catch (error) {
    console.error("AI Generation Error:", error);
    return { generatedDescription: input.initialDescription };
  }
}
