
'use server';
/**
 * @fileOverview An AI agent for analyzing project data.
 *
 * - analyzeProject - A function that handles the project analysis.
 * - ProjectAnalysisInput - The input type for the analyzeProject function.
 * - ProjectAnalysisOutput - The return type for the analyzeProject function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Project } from '@/lib/projects';

// We can't pass the full Project type directly due to potential complexities.
// We define a simpler schema for the AI prompt.
const ProjectAnalysisInputSchema = z.object({
    name: z.string(),
    description: z.string(),
    value: z.number(),
    totalCost: z.number(),
    totalIncome: z.number(),
    progress: z.number(),
    duration: z.string(),
});
export type ProjectAnalysisInput = z.infer<typeof ProjectAnalysisInputSchema>;

const ProjectAnalysisOutputSchema = z.object({
  summary: z.string().describe('A brief, one-paragraph summary of the project\'s current status.'),
  highlights: z.array(z.string()).describe('Three to four key positive highlights or achievements.'),
  recommendations: z.array(z.string()).describe('Three to four actionable recommendations or areas of concern.'),
});
export type ProjectAnalysisOutput = z.infer<typeof ProjectAnalysisOutputSchema>;

export async function analyzeProject(input: ProjectAnalysisInput): Promise<ProjectAnalysisOutput> {
  return projectAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'projectAnalysisPrompt',
  input: { schema: ProjectAnalysisInputSchema },
  output: { schema: ProjectAnalysisOutputSchema },
  prompt: `You are an expert project financial analyst. Analyze the following project data and provide a concise summary, key highlights, and actionable recommendations.

Project Name: {{{name}}}
Description: {{{description}}}
Total Contract Value: {{{value}}}
Total Realized Cost: {{{totalCost}}}
Total Realized Income (Paid + Invoiced): {{{totalIncome}}}
Overall Progress: {{{progress}}}%
Duration: {{{duration}}}

Based on this data, provide:
1.  A brief, insightful summary (one paragraph).
2.  3-4 key highlights (e.g., "Profit margin is strong", "Under budget so far").
3.  3-4 actionable recommendations or concerns (e.g., "Cost overrun in operational category", "Accelerate invoicing for completed work").

Be concise and professional.
`,
});

const projectAnalysisFlow = ai.defineFlow(
  {
    name: 'projectAnalysisFlow',
    inputSchema: ProjectAnalysisInputSchema,
    outputSchema: ProjectAnalysisOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
