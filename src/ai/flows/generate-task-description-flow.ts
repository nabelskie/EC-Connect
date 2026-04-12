/**
 * @fileOverview A Genkit flow that helps elderly users or caregivers write clear and comprehensive descriptions for assistance requests.
 *
 * - generateTaskDescription - A function that handles the generation of task descriptions.
 * - GenerateTaskDescriptionInput - The input type for the generateTaskDescription function.
 * - GenerateTaskDescriptionOutput - The return type for the generateTaskDescription function.
 */

import {ai} from '@/ai/genkit';
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

export async function generateTaskDescription(
  input: GenerateTaskDescriptionInput
): Promise<GenerateTaskDescriptionOutput> {
  // Mobile/Static Export safety: AI flows require a server environment.
  // If running in a static context (like an APK), we return the original text as a fallback.
  if (typeof window !== 'undefined') {
     return { generatedDescription: input.initialDescription };
  }
  return generateTaskDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTaskDescriptionPrompt',
  input: {schema: GenerateTaskDescriptionInputSchema},
  output: {schema: GenerateTaskDescriptionOutputSchema},
  prompt: `You are an AI assistant designed to help elderly users or caregivers write clear and comprehensive descriptions for assistance requests to volunteers.

Your goal is to expand on the provided initial description, ensuring all necessary details are captured so that a volunteer can fully understand what is needed.

Consider the task type and common requirements for such tasks. 
- For 'Groceries', include specific items if mentioned, or common essentials like milk, bread, or eggs if the description is vague.
- For 'Transportation', include pick-up/drop-off points or common destinations like the clinic or market.
- For 'Tech Support', detail the specific device or software issue like WhatsApp setup or phone settings.

Format the output clearly and politely. Do not ask questions back to the user.

--- Input Details ---
Task Type: {{{taskType}}}
Initial Description: {{{initialDescription}}}
{{#if location}}Location: {{{location}}}{{/if}}
{{#if urgencyLevel}}Urgency: {{{urgencyLevel}}}{{/if}}

--- Generated Comprehensive Description ---`,
});

const generateTaskDescriptionFlow = ai.defineFlow(
  {
    name: 'generateTaskDescriptionFlow',
    inputSchema: GenerateTaskDescriptionInputSchema,
    outputSchema: GenerateTaskDescriptionOutputSchema,
  },
  async input => {
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const {output} = await prompt(input);
        if (output) return output;
        throw new Error('Empty output from AI');
      } catch (error: any) {
        attempts++;
        if (attempts >= maxAttempts) {
           return { 
             generatedDescription: input.initialDescription 
           };
        }
        // Wait before retrying (exponentially): 1s, 2s...
        await new Promise(resolve => setTimeout(resolve, attempts * 1000));
      }
    }
    return { generatedDescription: input.initialDescription };
  }
);
