'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function MagneticTestPage() {
  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/reports">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Reports</span>
          </Link>
        </Button>
        <div>
          <h1 className="font-headline text-2xl font-bold">Magnetic Particle Test Report</h1>
          <p className="text-muted-foreground">Fill in the details to create a new report.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>New Report</CardTitle>
          <CardDescription>
            This is a placeholder for the Magnetic Particle Test report form.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Form fields for the Magnetic Particle Test report will go here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
