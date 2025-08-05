
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Beaker, Magnet, Waves, Radio, FileText, ArrowRight, PlusCircle, Zap, ClipboardCheck } from 'lucide-react';
import { HeaderCard } from '@/components/header-card';

const reportTypes = [
  { name: 'Penetrant Test', href: '/reports/penetrant', newHref: '/reports/penetrant/new', icon: Beaker, description: 'View and manage liquid penetrant testing reports.', iconColor: 'text-blue-500', shapeColor: 'text-blue-500/10' },
  { name: 'Magnetic Particle Test', href: '/reports/magnetic', newHref: '/reports/magnetic/new', icon: Magnet, description: 'View and manage magnetic particle testing reports.', iconColor: 'text-green-500', shapeColor: 'text-green-500/10' },
  { name: 'Ultrasonic Test', href: '/reports/ultrasonic', newHref: '/reports/ultrasonic/new', icon: Waves, description: 'View and manage ultrasonic testing reports.', iconColor: 'text-amber-500', shapeColor: 'text-amber-500/10' },
  { name: 'Radiographic Test', href: '/reports/radiographic', newHref: '/reports/radiographic/new', icon: Radio, description: 'View and manage radiographic testing reports.', iconColor: 'text-rose-500', shapeColor: 'text-rose-500/10' },
  { name: 'Other Methods', href: '/reports/other', newHref: '/reports/other/new', icon: FileText, description: 'View and manage reports for other testing methods.', iconColor: 'text-purple-500', shapeColor: 'text-purple-500/10' },
  { name: 'Flash Report (QMS)', href: '#', newHref: '#', icon: Magnet, description: 'Quickly generate and view flash reports for quality management.', iconColor: 'text-green-500', shapeColor: 'text-green-500/10' },
  { name: 'Inspection Report (QMS)', href: '#', newHref: '#', icon: ClipboardCheck, description: 'Create and access detailed QMS inspection reports.', iconColor: 'text-purple-500', shapeColor: 'text-purple-500/10' },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <HeaderCard
        title="Reporting"
        description="Select a non-destructive testing method to view existing reports or create a new one."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((reportType) => (
          <Card key={reportType.name} className="flex flex-col relative overflow-hidden">
             <svg
                className={`absolute -top-1 -right-1 h-24 w-24 ${reportType.shapeColor}`}
                fill="currentColor"
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                d="M62.3,-53.5C78.2,-41.5,86.8,-20.8,86.4,-0.4C86,20,76.6,40,61.9,54.1C47.2,68.2,27.1,76.4,5.4,75.3C-16.3,74.2,-32.7,63.7,-47.5,51.3C-62.3,38.8,-75.6,24.5,-80.5,6.7C-85.4,-11.1,-82,-32.5,-69.3,-45.5C-56.6,-58.5,-34.7,-63.1,-15.6,-64.3C3.5,-65.5,26.4,-65.5,43.2,-61.7C59.9,-57.9,59.9,-57.9,62.3,-53.5Z"
                transform="translate(100 100)"
                />
            </svg>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10">
                <CardTitle className="font-headline">{reportType.name}</CardTitle>
                <reportType.icon className={`h-8 w-8 ${reportType.iconColor}`} />
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between z-10">
                <CardDescription>{reportType.description}</CardDescription>
                <div className="w-full flex flex-col sm:flex-row sm:justify-between gap-2 mt-4">
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
