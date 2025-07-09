
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Beaker, Magnet, Waves, Radio, FileText, ArrowRight, PlusCircle } from 'lucide-react';

const reportTypes = [
  { name: 'Penetrant Test', href: '/reports/penetrant', newHref: '/reports/penetrant/new', icon: Beaker, description: 'View and manage liquid penetrant testing reports.' },
  { name: 'Magnetic Particle Test', href: '/reports/magnetic', newHref: '/reports/magnetic/new', icon: Magnet, description: 'View and manage magnetic particle testing reports.' },
  { name: 'Ultrasonic Test', href: '/reports/ultrasonic', newHref: '/reports/ultrasonic/new', icon: Waves, description: 'View and manage ultrasonic testing reports.' },
  { name: 'Radiographic Test', href: '/reports/radiographic', newHref: '/reports/radiographic/new', icon: Radio, description: 'View and manage radiographic testing reports.' },
  { name: 'Other Methods', href: '/reports/other', newHref: '/reports/other/new', icon: FileText, description: 'View and manage reports for other testing methods.' },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reporting</CardTitle>
          <CardDescription>
            Select a non-destructive testing method to view existing reports or create a new one.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((reportType) => (
          <Card key={reportType.name} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4">
                <reportType.icon className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="font-headline">{reportType.name}</CardTitle>
                  <CardDescription>{reportType.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex items-end">
              <div className="w-full flex justify-between items-center">
                  <Button variant="outline" asChild>
                    <Link href={reportType.href}>
                      View Reports <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href={reportType.newHref}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New
                    </Link>
                  </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
