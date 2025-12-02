'use server';
/**
 * @fileOverview Generates personalized treatment tips for plant diseases.
 *
 * - generateTreatmentTips - A function that generates personalized treatment tips.
 * - TreatmentTipsInput - The input type for the generateTreatmentTips function.
 * - TreatmentTipsOutput - The return type for the generateTreatmentTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TreatmentTipsInputSchema = z.object({
  plantName: z.string().describe('The common name of the plant.'),
  diseaseName: z.string().describe('The name of the disease detected.'),
});
export type TreatmentTipsInput = z.infer<typeof TreatmentTipsInputSchema>;

const TreatmentTipsOutputSchema = z.object({
  treatmentTips: z
    .string()
    .describe(
      'A list of personalized treatment tips for the specified plant and disease.'
    ),
});
export type TreatmentTipsOutput = z.infer<typeof TreatmentTipsOutputSchema>;

export async function generateTreatmentTips(
  input: TreatmentTipsInput
): Promise<TreatmentTipsOutput> {
  return generateTreatmentTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'treatmentTipsPrompt',
  input: {schema: TreatmentTipsInputSchema},
  output: {schema: TreatmentTipsOutputSchema},
  prompt: `You are an expert horticulturalist specializing in plant disease treatment.

  Based on the plant name and disease, provide a concise list of suggestions to cure the plant.

  Plant: {{{plantName}}}
  Disease: {{{diseaseName}}}

  Cure Suggestions:`,
});

const generateTreatmentTipsFlow = ai.defineFlow(
  {
    name: 'generateTreatmentTipsFlow',
    inputSchema: TreatmentTipsInputSchema,
    outputSchema: TreatmentTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
