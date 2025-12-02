'use server';

import { z } from 'zod';
import { detectDisease, type DetectDiseaseOutput } from '@/ai/flows/disease-detection';
import { generateTreatmentTips, type TreatmentTipsOutput } from '@/ai/flows/personalized-prevention-tips';

const formSchema = z.object({
  photoDataUri: z.string().min(1, 'Plant image is required.'),
});

export type FormState = {
  detection?: DetectDiseaseOutput;
  treatment?: TreatmentTipsOutput;
  error?: string;
  success: boolean;
};

export async function analyzePlantDisease(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const rawFormData = {
      photoDataUri: formData.get('photoDataUri'),
    };

    const validatedFields = formSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid form data. Please check your inputs.',
      };
    }
    
    const { photoDataUri } = validatedFields.data;

    const detectionResult = await detectDisease({ photoDataUri });

    if (!detectionResult) {
        throw new Error("Disease detection failed to return a result.");
    }
    
    if (detectionResult.diseaseDetected) {
      const treatmentResult = await generateTreatmentTips({
        plantName: detectionResult.plantName,
        diseaseName: detectionResult.diseaseName,
      });

      if (!treatmentResult) {
        throw new Error("Treatment tips generation failed to return a result.");
      }

      return {
        success: true,
        detection: detectionResult,
        treatment: treatmentResult,
      };
    }

    return {
      success: true,
      detection: detectionResult,
    };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      success: false,
      error: `Analysis failed: ${errorMessage}`,
    };
  }
}
