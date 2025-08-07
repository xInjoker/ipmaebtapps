
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProjects } from '@/context/ProjectContext';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/lib/projects';
import { ProjectForm } from '@/components/project-form';
import { useAuth } from '@/context/AuthContext';

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { getProjectById, updateProject } = useProjects();
  const { branches } = useAuth();
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

  const handleSave = useCallback(async (projectData: Partial<Project>, period: string, duration: string, contractStartDate?: string, contractEndDate?: string) => {
    if (!project) return;
    setIsLoading(true);

    const executorName = branches.find(b => b.id === projectData.contractExecutor)?.name;

    const updatedData = {
        ...project,
        ...projectData,
        period,
        duration,
        contractStartDate,
        contractEndDate,
        contractExecutor: executorName || project.contractExecutor,
    };

    try {
        await updateProject(project.id, updatedData);
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
  }, [project, updateProject, branches, router, toast]);
  
  if (!project) {
    return <div>Loading...</div>;
  }

  return <ProjectForm project={project} onSave={handleSave} isLoading={isLoading} />;
}
