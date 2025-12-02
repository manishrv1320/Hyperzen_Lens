// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Detects diseases in plant leaves from uploaded images.
 *
 * - detectDisease - Detects diseases in plant leaves from uploaded images.
 * - DetectDiseaseInput - The input type for the detectDisease function.
 * - DetectDiseaseOutput - The return type for the detectDisease function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant leaf, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectDiseaseInput = z.infer<typeof DetectDiseaseInputSchema>;

const DetectDiseaseOutputSchema = z.object({
  diseaseDetected: z.boolean().describe('Whether a disease is detected or not.'),
  diseaseName: z.string().describe('The name of the detected disease, if any.'),
  confidence: z.number().describe('The confidence level of the disease detection.'),
});
export type DetectDiseaseOutput = z.infer<typeof DetectDiseaseOutputSchema>;

export async function detectDisease(input: DetectDiseaseInput): Promise<DetectDiseaseOutput> {
  return detectDiseaseFlow(input);
}

const detectDiseasePrompt = ai.definePrompt({
  name: 'detectDiseasePrompt',
  input: {schema: DetectDiseaseInputSchema},
  output: {schema: DetectDiseaseOutputSchema},
  prompt: `You are an expert plant pathologist. Analyze the image of the plant leaf and determine if any disease is present.

  Image: {{media url=photoDataUri}}

  Respond with whether a disease is detected, the name of the disease, and a confidence level.`,
});

const detectDiseaseFlow = ai.defineFlow(
  {
    name: 'detectDiseaseFlow',
    inputSchema: DetectDiseaseInputSchema,
    outputSchema: DetectDiseaseOutputSchema,
  },
  async input => {
    const {output} = await detectDiseasePrompt(input);
    return output!;
  }
);
