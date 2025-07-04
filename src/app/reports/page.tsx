'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ChevronRight, Beaker, Magnet, Waves, Radio, FileText } from 'lucide-react';

const reportTypes = [
  { name: 'Penetrant Test', href: '/reports/penetrant', icon: Beaker, description: 'Create and manage liquid penetrant testing reports.' },
  { name: 'Magnetic Particle Test', href: '/reports/magnetic', icon: Magnet, description: 'Create and manage magnetic particle testing reports.' },
  { name: 'Ultrasonic Test', href: '/reports/ultrasonic', icon: Waves, description: 'Create and manage ultrasonic testing reports.' },
  { name: 'Radiographic Test', href: '/reports/radiographic', icon: Radio, description: 'Create and manage radiographic testing reports.' },
  { name: 'Other Methods', href: '/reports/other', icon: FileText, description: 'Create and manage reports for other testing methods.' },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Reporting</CardTitle>
          <CardDescription>
            Select a non-destructive testing method to create or view a report.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => (
          <Card key={report.name} className="hover:border-primary/50 transition-colors">
            <Link href={report.href} className="flex flex-col h-full">
              <CardHeader className="flex-row items-center gap-4">
                <report.icon className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>{report.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </CardContent>
              <div className="flex items-center p-6 pt-0 text-sm font-medium text-primary">
                <span>Create Report</span>
                <ChevronRight className="ml-2 h-4 w-4" />
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
