

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProjects } from '@/context/ProjectContext';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/lib/projects';
import { ProjectForm } from '@/components/project-form';

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { getProjectById, updateProject } = useProjects();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const item = getProjectById(projectId);
    if (item) {
      setProject(item);
    } else {
      toast({ variant: 'destructive', title: 'Project not found' });
      router.push('/projects');
    }
  }, [projectId, getProjectById, router, toast]);

  const handleSave = useCallback(async (projectData: Partial<Project>, newDocs: { contractFile: File | null, rabFile: File | null, otherFiles: File[] }) => {
    if (!project) return;
    setIsLoading(true);

    try {
        await updateProject(project.id, projectData, newDocs);
        toast({ title: 'Project Updated', description: `Successfully updated "${project.name}".` });
        router.push(`/projects/${project.id}`);
    } catch (error) {
        console.error("Failed to update project", error);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not save project changes.',
        });
    } finally {
        setIsLoading(false);
    }
  }, [project, updateProject, router, toast]);
  
  if (!project) {
    return <div>Loading...</div>;
  }

  return <ProjectForm project={project} onSave={handleSave as any} isLoading={isLoading} />;
}
