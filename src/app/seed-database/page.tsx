
'use client';

import { useState, useCallback } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { seedDatabase } from '@/ai/flows/seed-database-flow';

export default function SeedDatabasePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { toast } = useToast();

  const handleSeed = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await seedDatabase();
      toast({
        title: 'Database Seeding Successful',
        description: result,
      });
    } catch (error) {
      console.error("Database seeding failed:", error);
      toast({
        variant: 'destructive',
        title: 'Seeding Failed',
        description: 'Could not seed the database. Check the console for errors.',
      });
    } finally {
      setIsLoading(false);
      setIsConfirmOpen(false);
    }
  }, [toast]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Database Management</CardTitle>
          <CardDescription>
            Use this tool to populate your Firestore database with initial data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start rounded-md border border-destructive/50 bg-destructive/10 p-4">
            <AlertTriangle className="mr-3 h-8 w-8 text-destructive" />
            <div className="flex-1">
              <h4 className="font-bold text-destructive">Warning: Destructive Action</h4>
              <p className="text-sm text-destructive/80">
                Running this action will overwrite existing collections in your
                database (roles, users, branches). This cannot be undone.
                Only proceed if you are setting up the project for the first time
                or need to reset the data.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsConfirmOpen(true)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <DatabaseZap className="mr-2 h-4 w-4" />
            )}
            Seed Database
          </Button>
        </CardContent>
      </Card>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will overwrite the 'users', 'roles', and 'branches' collections
              in your Firestore database with the initial data set. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSeed}
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes, Overwrite Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
