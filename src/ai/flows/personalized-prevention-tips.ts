'use server';
/**
 * @fileOverview Generates personalized prevention tips for plant diseases.
 *
 * - generatePreventionTips - A function that generates personalized prevention tips.
 * - PreventionTipsInput - The input type for the generatePreventionTips function.
 * - PreventionTipsOutput - The return type for the generatePreventionTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PreventionTipsInputSchema = z.object({
  plantName: z.string().describe('The common name of the plant.'),
  diseaseName: z.string().describe('The name of the disease detected.'),
});
export type PreventionTipsInput = z.infer<typeof PreventionTipsInputSchema>;

const PreventionTipsOutputSchema = z.object({
  preventionTips: z
    .string()
    .describe(
      'A list of personalized prevention tips for the specified plant and disease.'
    ),
});
export type PreventionTipsOutput = z.infer<typeof PreventionTipsOutputSchema>;

export async function generatePreventionTips(
  input: PreventionTipsInput
): Promise<PreventionTipsOutput> {
  return generatePreventionTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'preventionTipsPrompt',
  input: {schema: PreventionTipsInputSchema},
  output: {schema: PreventionTipsOutputSchema},
  prompt: `You are an expert horticulturalist specializing in plant disease prevention.

  Based on the plant name and disease, provide a concise list of personalized prevention tips.

  Plant: {{{plantName}}}
  Disease: {{{diseaseName}}}

  Prevention Tips:`,
});

const generatePreventionTipsFlow = ai.defineFlow(
  {
    name: 'generatePreventionTipsFlow',
    inputSchema: PreventionTipsInputSchema,
    outputSchema: PreventionTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
