

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { type Project, type ProjectDocument } from '@/lib/projects';
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ProjectForm } from '@/components/project-form';

export default function NewProjectPage() {
  const router = useRouter();
  const { addProject } = useProjects();
  const { user, isHqUser, branches } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddProject = useCallback(async (projectData: Partial<Project>, newDocs: { contractFile: File | null, rabFile: File | null, otherFiles: File[] }) => {
    setIsLoading(true);
    
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error' });
      setIsLoading(false);
      return;
    }

    try {
        await addProject(projectData, newDocs);
        toast({
            title: 'Project Added',
            description: `Project "${projectData.name}" has been successfully created.`,
        });
        router.push('/projects');
    } catch (error) {
        if (error instanceof Error) {
            toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: error.message || 'Could not save the project to the database.',
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: 'An unknown error occurred while saving the project.',
            });
        }
    } finally {
        setIsLoading(false);
    }
  }, [addProject, router, toast, user]);

  return <ProjectForm onSave={handleAddProject as any} isLoading={isLoading} />;
}
