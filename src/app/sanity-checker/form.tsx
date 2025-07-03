'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { checkReportSanity, type SanityCheckState } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, Lightbulb, Loader, AlertTriangle, List } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const initialState: SanityCheckState = {
  status: 'idle',
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Lightbulb className="mr-2 h-4 w-4" />
          Check Sanity
        </>
      )}
    </Button>
  );
}

export function SanityCheckForm() {
  const [state, formAction] = useActionState(checkReportSanity, initialState);
  const { pending } = useFormStatus();

  return (
    <form action={formAction} className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="projectDetails">Project Details</Label>
          <Textarea
            id="projectDetails"
            name="projectDetails"
            placeholder="Describe the project objectives, timelines, and key milestones..."
            rows={5}
          />
          {state.errors?.projectDetails && (
            <p className="text-sm text-destructive">{state.errors.projectDetails[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="financialData">Financial Data</Label>
          <Textarea
            id="financialData"
            name="financialData"
            placeholder="Provide budget allocations, expenses, and revenue projections..."
            rows={5}
          />
           {state.errors?.financialData && (
            <p className="text-sm text-destructive">{state.errors.financialData[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoiceData">Invoice Data</Label>
          <Textarea
            id="invoiceData"
            name="invoiceData"
            placeholder="List invoice amounts, dates, and payment statuses..."
            rows={5}
          />
           {state.errors?.invoiceData && (
            <p className="text-sm text-destructive">{state.errors.invoiceData[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="riskAssessment">Risk Assessment</Label>
          <Textarea
            id="riskAssessment"
            name="riskAssessment"
            placeholder="Detail potential risks, their likelihood, and impact..."
            rows={5}
          />
           {state.errors?.riskAssessment && (
            <p className="text-sm text-destructive">{state.errors.riskAssessment[0]}</p>
          )}
        </div>
        <div className="col-span-1 space-y-2 md:col-span-2">
          <Label htmlFor="progressUpdates">Progress Updates</Label>
          <Textarea
            id="progressUpdates"
            name="progressUpdates"
            placeholder="Summarize completed tasks, upcoming activities, and any deviations..."
            rows={5}
          />
           {state.errors?.progressUpdates && (
            <p className="text-sm text-destructive">{state.errors.progressUpdates[0]}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <SubmitButton />
      </div>

      {pending && (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </CardContent>
        </Card>
      )}

      {state.status === 'error' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state.status === 'success' && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Analysis Complete</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
          {state.suggestions && state.suggestions.length > 0 && (
             <div className="mt-4 rounded-md border bg-background/50 p-4">
                <h3 className="mb-2 flex items-center font-semibold"><List className="mr-2 h-4 w-4"/> Suggestions:</h3>
                <ul className="list-disc space-y-2 pl-5">
                    {state.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm">{suggestion}</li>
                    ))}
                </ul>
             </div>
          )}
        </Alert>
      )}
    </form>
  );
}
