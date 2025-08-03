
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useInspectors } from '@/context/InspectorContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { type Inspector } from '@/lib/inspectors';
import { InspectorDetails } from '@/components/inspector-details';


export default function InspectorDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const inspectorId = params.id as string;
  const { getInspectorById } = useInspectors();
  const [inspector, setInspector] = useState<Inspector | null>(null);

  useEffect(() => {
    if (inspectorId) {
      const item = getInspectorById(inspectorId);
      setInspector(item || null);
    }
  }, [inspectorId, getInspectorById]);

  if (!inspector) {
    return (
      <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">Inspector Not Found</h1>
        <p className="text-muted-foreground">The inspector you are looking for does not exist.</p>
        <Button asChild className="mt-4">
          <Link href="/inspectors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inspector Database
          </Link>
        </Button>
      </div>
    );
  }
  
  return <InspectorDetails inspector={inspector} />
}
