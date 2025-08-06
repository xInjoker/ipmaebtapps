
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { seedDatabaseFlow } from '@/ai/flows/seed-database-flow';
import { Loader2 } from 'lucide-react';

export default function SeedDatabasePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const { toast } = useToast();

  const handleSeed = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await seedDatabaseFlow();
      setResult(response);
      toast({
        title: 'Database Seeding Successful',
        description: 'Your Firestore database has been populated with initial data.',
      });
    } catch (error) {
      console.error('Database seeding failed:', error);
      toast({
        variant: 'destructive',
        title: 'Database Seeding Failed',
        description: 'Could not seed the database. Check the console for errors.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Database Seeding</CardTitle>
        <CardDescription>
          Click the button below to populate your Firestore database with the
          initial data for the application. This should only be done once on a
          fresh database.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleSeed} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Seeding...
            </>
          ) : (
            'Seed Database'
          )}
        </Button>
        {result && (
          <div className="p-4 rounded-md bg-muted text-sm">
            <h4 className="font-semibold mb-2">Seeding Results:</h4>
            <pre className="overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
