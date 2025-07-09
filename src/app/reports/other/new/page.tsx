
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function OtherMethodsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
              <Link href="/reports/other">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Reports</span>
              </Link>
            </Button>
            <div>
              <CardTitle>Other Methods Report</CardTitle>
              <CardDescription>Fill in the details to create a new report.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p>Form fields for the Other Methods report will go here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
