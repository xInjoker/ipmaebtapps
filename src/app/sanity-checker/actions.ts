'use server';

import { reportSanityChecker } from '@/ai/flows/report-sanity-checker';
import { z } from 'zod';

const formSchema = z.object({
  projectDetails: z.string().min(10, { message: 'Project details must be at least 10 characters.' }),
  financialData: z.string().min(10, { message: 'Financial data must be at least 10 characters.' }),
  invoiceData: z.string().min(10, { message: 'Invoice data must be at least 10 characters.' }),
  riskAssessment: z.string().min(10, { message: 'Risk assessment must be at least 10 characters.' }),
  progressUpdates: z.string().min(10, { message: 'Progress updates must be at least 10 characters.' }),
});

export interface SanityCheckState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
  suggestions?: string[];
  errors?: {
    projectDetails?: string[];
    financialData?: string[];
    invoiceData?: string[];
    riskAssessment?: string[];
    progressUpdates?: string[];
  };
}

export async function checkReportSanity(
  prevState: SanityCheckState,
  formData: FormData
): Promise<SanityCheckState> {
  const validatedFields = formSchema.safeParse({
    projectDetails: formData.get('projectDetails'),
    financialData: formData.get('financialData'),
    invoiceData: formData.get('invoiceData'),
    riskAssessment: formData.get('riskAssessment'),
    progressUpdates: formData.get('progressUpdates'),
  });

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Please fix the errors below.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await reportSanityChecker(validatedFields.data);
    if (result.suggestions && result.suggestions.length > 0) {
      return {
        status: 'success',
        message: 'Analysis complete. Here are the suggestions:',
        suggestions: result.suggestions,
      };
    } else {
      return {
        status: 'success',
        message: 'No specific suggestions were found based on the provided data.',
        suggestions: [],
      };
    }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      status: 'error',
      message: `An error occurred during analysis: ${errorMessage}`,
    };
  }
}
