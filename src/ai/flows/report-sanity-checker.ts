'use server';

/**
 * @fileOverview This file defines a Genkit flow for a report sanity checker AI agent.
 *
 * The agent is designed to review project data and provide suggestions for important facts
 * or potential issues that the project manager might have overlooked in their reports.
 *
 * @interface ReportSanityCheckerInput - Defines the input for the report sanity checker.
 * @interface ReportSanityCheckerOutput - Defines the output of the report sanity checker.
 * @function reportSanityChecker - The main function to trigger the report sanity check flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReportSanityCheckerInputSchema = z.object({
  projectDetails: z
    .string()
    .describe('Detailed information about the project, including objectives, timelines, and key milestones.'),
  financialData: z
    .string()
    .describe('Comprehensive financial data, including budget allocations, expenses, and revenue projections.'),
  invoiceData: z
    .string()
    .describe('Information on invoicing, including amounts, dates, and payment statuses.'),
  riskAssessment: z
    .string()
    .describe('Assessment of potential risks, their likelihood, and impact on the project.'),
  progressUpdates: z
    .string()
    .describe('Regular updates on project progress, including completed tasks, upcoming activities, and any deviations from the plan.'),
});

export type ReportSanityCheckerInput = z.infer<typeof ReportSanityCheckerInputSchema>;

const ReportSanityCheckerOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of suggestions for important facts or potential issues that may have been overlooked in the project reports.'),
});

export type ReportSanityCheckerOutput = z.infer<typeof ReportSanityCheckerOutputSchema>;

export async function reportSanityChecker(input: ReportSanityCheckerInput): Promise<ReportSanityCheckerOutput> {
  return reportSanityCheckerFlow(input);
}

const reportSanityCheckerPrompt = ai.definePrompt({
  name: 'reportSanityCheckerPrompt',
  input: {schema: ReportSanityCheckerInputSchema},
  output: {schema: ReportSanityCheckerOutputSchema},
  prompt: `You are an AI assistant that reviews project data and provides suggestions for important facts or potential issues that might have been overlooked in project reports.

  Analyze the following project information:

  Project Details: {{{projectDetails}}}
  Financial Data: {{{financialData}}}
  Invoice Data: {{{invoiceData}}}
  Risk Assessment: {{{riskAssessment}}}
  Progress Updates: {{{progressUpdates}}}

  Based on this information, provide a list of specific and actionable suggestions for facts or issues that the project manager should consider including in their report to ensure accuracy and completeness.
  Format your response as a list of strings.`,
});

const reportSanityCheckerFlow = ai.defineFlow(
  {
    name: 'reportSanityCheckerFlow',
    inputSchema: ReportSanityCheckerInputSchema,
    outputSchema: ReportSanityCheckerOutputSchema,
  },
  async input => {
    const {output} = await reportSanityCheckerPrompt(input);
    return output!;
  }
);
