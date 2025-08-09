
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, DatabaseZap, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { seedDatabase } from '@/ai/flows/seed-database-flow';

export default function SeedDatabasePage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSeed = async () => {
    setIsLoading(true);
    try {
      const result = await seedDatabase();
      toast({
        title: 'Database Seeding Complete',
        description: result,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Seeding Failed',
        description: 'An error occurred while seeding the database.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DatabaseZap className="h-6 w-6" />
            Seed Firestore Database
          </CardTitle>
          <CardDescription>
            Populate your Firestore database with initial data for roles and branches.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-start gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                <div className="space-y-1">
                    <h4 className="font-semibold text-destructive">Warning: Overwrites Data</h4>
                    <p className="text-sm text-destructive/80">
                        Running this action will overwrite any existing documents in the 'roles' and 'branches' collections with the initial dataset. This action cannot be undone.
                    </p>
                </div>
            </div>
          <Button onClick={handleSeed} disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <DatabaseZap className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Seeding in progress...' : 'Seed Database'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
