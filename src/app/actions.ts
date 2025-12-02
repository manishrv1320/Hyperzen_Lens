'use server';

import { z } from 'zod';
import { detectDisease, type DetectDiseaseOutput } from '@/ai/flows/disease-detection';
import { generatePreventionTips, type PreventionTipsOutput } from '@/ai/flows/personalized-prevention-tips';

const formSchema = z.object({
  plantName: z.string().min(1, 'Plant name is required.'),
  photoDataUri: z.string().min(1, 'Plant image is required.'),
});

export type FormState = {
  detection?: DetectDiseaseOutput;
  prevention?: PreventionTipsOutput;
  error?: string;
  success: boolean;
};

export async function analyzePlantDisease(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const rawFormData = {
      plantName: formData.get('plantName'),
      photoDataUri: formData.get('photoDataUri'),
    };

    const validatedFields = formSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid form data. Please check your inputs.',
      };
    }
    
    const { plantName, photoDataUri } = validatedFields.data;

    const detectionResult = await detectDisease({ photoDataUri });

    if (!detectionResult) {
        throw new Error("Disease detection failed to return a result.");
    }
    
    if (detectionResult.diseaseDetected) {
      const preventionResult = await generatePreventionTips({
        plantName,
        diseaseName: detectionResult.diseaseName,
      });

      if (!preventionResult) {
        throw new Error("Prevention tips generation failed to return a result.");
      }

      return {
        success: true,
        detection: detectionResult,
        prevention: preventionResult,
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
