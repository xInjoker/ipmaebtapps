
'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, CircleCheck, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react';
import { analyzeProject, type ProjectAnalysisInput, type ProjectAnalysisOutput } from '@/ai/flows/project-analysis-flow';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/lib/projects';

type ProjectAiSummaryProps = {
  project: Project | null;
  totalCost: number;
  totalIncome: number;
  progress: number;
};

export function ProjectAiSummary({ project, totalCost, totalIncome, progress }: ProjectAiSummaryProps) {
  const [analysis, setAnalysis] = useState<ProjectAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateAnalysis = useCallback(async () => {
    if (!project) return;
    
    setIsLoading(true);
    setAnalysis(null);
    const analysisInput: ProjectAnalysisInput = {
      name: project.name,
      description: project.description,
      value: project.value,
      totalCost,
      totalIncome,
      progress,
      duration: project.duration,
      invoices: (project.invoices || []).map(i => ({ status: i.status, amount: i.value })),
      costs: (project.costs || []).map(c => ({
        category: c.category,
        budgetedAmount: project.budgets?.[c.category] || 0,
        actualAmount: c.amount,
      })),
    };
    try {
      const result = await analyzeProject(analysisInput);
      setAnalysis(result);
    } catch (error) {
      console.error("Failed to generate project analysis:", error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Could not generate the AI summary. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [project, totalCost, totalIncome, progress, toast]);
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin mb-4" />
          <p className="font-semibold">Generating Analysis...</p>
          <p className="text-sm">Please wait while the AI reviews the project data.</p>
        </div>
      );
    }

    if (analysis) {
      return (
        <div className="space-y-4 text-sm">
           <div>
            <h4 className="font-semibold text-base mb-2">Executive Summary</h4>
            <p className="text-muted-foreground">{analysis.executiveSummary}</p>
          </div>

          <div>
            <h4 className="font-semibold text-base mb-2">Core Metrics</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Cost Performance Index (CPI): <span className="font-mono">{analysis.coreMetrics.cpi.toFixed(2)}</span></li>
              <li>Est. at Completion (EAC): <span className="font-mono">{analysis.coreMetrics.eac.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span></li>
              <li>Profit Forecast: <span className="font-mono">{analysis.coreMetrics.profitForecast.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span></li>
               <li>Current Margin: <span className="font-mono">{analysis.coreMetrics.currentMargin.toFixed(2)}%</span></li>
              <li>Projected Margin: <span className="font-mono">{analysis.coreMetrics.projectedMargin.toFixed(2)}%</span></li>
            </ul>
          </div>
           <div>
            <h4 className="font-semibold text-base mb-2">Cash Flow Analysis</h4>
            <p className="text-muted-foreground">{analysis.cashFlowAnalysis}</p>
          </div>
           <div>
            <h4 className="font-semibold text-base mb-2 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Risk Assessment</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {analysis.riskAssessment.map((item, index) => <li key={index}><strong>{item.risk}</strong> (Impact: {item.impact}, Likelihood: {item.likelihood}) {item.mitigation && `- Mitigation: ${item.mitigation}`}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-2 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-500"/> Recommendations</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {analysis.recommendations.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <Wand2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg">AI Project Analysis</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
          Click the button below to generate an automated summary, highlights, and recommendations based on this project's data.
        </p>
        <Button onClick={handleGenerateAnalysis}>
          <Wand2 className="mr-2 h-4 w-4" />
          Generate Analysis
        </Button>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Summary & Analysis</CardTitle>
        <CardDescription>Automated insights based on project data.</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px] overflow-y-auto p-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
