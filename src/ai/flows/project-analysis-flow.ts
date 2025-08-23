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

// Define schemas for cost and invoice items
const CostItemSchema = z.object({
  category: z.string(),
  budgetedAmount: z.number(),
  actualAmount: z.number(),
  forecastedAmount: z.number().optional(),
});

const InvoiceItemSchema = z.object({
  status: z.string().transform((val) => {
    // Normalize different status variations
    if (val.toLowerCase().includes('document') || val.toLowerCase().includes('doc prep')) {
      return 'Doc Prep';
    }
    if (val === 'PAD') return 'PAD';
    if (val.toLowerCase().includes('invoiced')) return 'Invoiced';
    if (val.toLowerCase().includes('paid')) return 'Paid';
    return val;
  }),
  amount: z.number(),
  daysOutstanding: z.number().optional(),
});

const ProjectAnalysisInputSchema = z.object({
    name: z.string(),
    description: z.string(),
    value: z.number(),
    totalCost: z.number(),
    totalIncome: z.number(),
    progress: z.number(),
    duration: z.string(),
    invoices: z.array(InvoiceItemSchema).optional(),
    costs: z.array(CostItemSchema).optional(),
});
export type ProjectAnalysisInput = z.infer<typeof ProjectAnalysisInputSchema>;

const ProjectAnalysisOutputSchema = z.object({
  executiveSummary: z.string().describe('One-paragraph high-level overview of financial health'),
  coreMetrics: z.object({
    cpi: z.number().describe('Cost Performance Index'),
    eac: z.number().describe('Estimated Cost at Completion'),
    profitForecast: z.number().describe('Projected final profit/loss'),
    currentMargin: z.number().describe('Current gross profit margin'),
    projectedMargin: z.number().describe('Projected final gross profit margin'),
  }),
  cashFlowAnalysis: z.string().describe('Cash conversion cycle and working capital assessment'),
  riskAssessment: z.array(z.object({
    risk: z.string(),
    impact: z.enum(['High', 'Medium', 'Low']),
    likelihood: z.enum(['High', 'Medium', 'Low']),
    mitigation: z.string().optional(),
  })),
  recommendations: z.array(z.string()).describe('3-4 strategic actionable recommendations'),
});
export type ProjectAnalysisOutput = z.infer<typeof ProjectAnalysisOutputSchema>;

export async function analyzeProject(input: ProjectAnalysisInput): Promise<ProjectAnalysisOutput> {
  // Calculate financial metrics
  const earnedValue = input.totalIncome; // Paid + Invoiced + PAD
  const actualCost = input.totalCost;
  
  const cpi = earnedValue / actualCost;
  const eac = input.value / cpi;
  const profitForecast = input.value - eac;
  const currentMargin = (input.totalIncome - input.totalCost) / input.totalIncome;
  const projectedMargin = (input.value - eac) / input.value;
  
  // Format the metrics for display
  const formattedMetrics = {
    cpi: parseFloat(cpi.toFixed(3)),
    eac: parseFloat(eac.toFixed(2)),
    profitForecast: parseFloat(profitForecast.toFixed(2)),
    currentMargin: parseFloat((currentMargin * 100).toFixed(2)),
    projectedMargin: parseFloat((projectedMargin * 100).toFixed(2))
  };
  
  // Create the prompt with pre-calculated metrics
  const promptText = `Role: You are an expert Senior Financial Analyst and Project Controller. Your specialization is in conducting deep-dive financial health assessments for complex projects, focusing on profitability, cash flow management, and risk mitigation. You provide data-driven, actionable insights in a clear, professional report format.

Primary Objective: Conduct a comprehensive financial and operational analysis of the provided project data. Your goal is to identify key financial risks and opportunities, assess the project's overall health, and provide prioritized, strategic recommendations to senior management to ensure maximum profitability and project success.

**Part 1: Executive Financial Summary**
- Provide a high-level overview (one paragraph) of the project's financial health, covering key metrics, immediate concerns, and overall profitability outlook.

**Part 2: Core Financial Metrics & Profitability Analysis**
- **Cost Performance Index (CPI):** ${formattedMetrics.cpi} (Earned Value / Actual Cost). For Earned Value, we used Paid + Invoiced + PAD (Total Realized Income). A CPI > 1 indicates cost efficiency.
- **Estimated Cost at Completion (EAC):** Rp ${formattedMetrics.eac.toLocaleString('id-ID')} (Total Contract Value / CPI). This forecasts the total cost based on current performance.
- **Profit / Loss Forecast:** Rp ${formattedMetrics.profitForecast.toLocaleString('id-ID')} (Total Contract Value - EAC).
- **Gross Profit Margin Analysis:** Current margin is ${formattedMetrics.currentMargin}% and projected final margin is ${formattedMetrics.projectedMargin}%.

**Part 3: Cash Flow & Working Capital Analysis**
- **Cash Conversion Cycle:** Analyze the time gap between when costs are incurred and when payment is received.
- **Cash Flow Bottlenecks:** Identify potential bottlenecks in the invoicing pipeline.
- **Working Capital Assessment:** Assess if the project is self-funding or requires significant working capital.

**Part 4: Risk Assessment & Budget Variance**
- **Budget vs. Actuals:** Analyze cost performance and identify potential variances.
- **Financial Risks:** Identify the top 3 financial risks to the project with Impact/Likelihood assessment.

**Part 5: Strategic Recommendations**
- Provide 3-4 concrete, actionable strategic recommendations.

**Project Data:**
- Project Name: ${input.name}
- Description: ${input.description}
- Total Contract Value: Rp ${input.value.toLocaleString('id-ID')}
- Total Realized Cost: Rp ${input.totalCost.toLocaleString('id-ID')}
- Total Realized Income: Rp ${input.totalIncome.toLocaleString('id-ID')}
- Overall Progress: ${input.progress}%
- Duration: ${input.duration}

${input.invoices ? `**Invoice Data:**
\`\`\`json
${JSON.stringify(input.invoices, null, 2)}
\`\`\`` : '**Note:** No detailed invoice data provided. Base your cash flow analysis on available metrics.'}

${input.costs ? `**Cost Data:**
\`\`\`json
${JSON.stringify(input.costs, null, 2)}
\`\`\`` : '**Note:** No detailed cost data provided. Base your budget variance analysis on available metrics.'}

**Formatting Requirements:**
- All financial figures must be formatted as Indonesian Rupiah currency (e.g., Rp 1.500.000.000)
- Present analysis in clear sections
- Be concise and professional`;

  try {
    // Use the AI to generate the analysis
    const response = await ai.generate({
      prompt: promptText,
      output: { schema: ProjectAnalysisOutputSchema },
    });
    
    // Ensure the response includes the calculated metrics
    const aiResponse = response.output as ProjectAnalysisOutput;
    
    // Merge the AI response with our calculated metrics
    const result = {
      ...aiResponse,
      coreMetrics: {
        ...aiResponse.coreMetrics,
        // Ensure our calculated metrics are included
        cpi: formattedMetrics.cpi,
        eac: formattedMetrics.eac,
        profitForecast: formattedMetrics.profitForecast,
        currentMargin: formattedMetrics.currentMargin,
        projectedMargin: formattedMetrics.projectedMargin
      }
    };
    
    return result;
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    
    // Fallback response if AI generation fails
    return {
      executiveSummary: 'Unable to generate analysis due to an error.',
      coreMetrics: {
        cpi: formattedMetrics.cpi,
        eac: formattedMetrics.eac,
        profitForecast: formattedMetrics.profitForecast,
        currentMargin: formattedMetrics.currentMargin,
        projectedMargin: formattedMetrics.projectedMargin
      },
      cashFlowAnalysis: 'Unable to generate cash flow analysis due to an error.',
      riskAssessment: [],
      recommendations: ['Please try again later.']
    };
  }
}

// Simple flow definition without complex transformations
const projectAnalysisFlow = ai.defineFlow(
  {
    name: 'projectAnalysisFlow',
    inputSchema: ProjectAnalysisInputSchema,
    outputSchema: ProjectAnalysisOutputSchema,
  },
  async (input) => {
    return analyzeProject(input);
  }
);