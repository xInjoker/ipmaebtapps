
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { type Project } from '@/lib/projects';
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

  const handleAddProject = useCallback(async (projectData: Partial<Project>, period: string, duration: string, contractStartDate?: string, contractEndDate?: string) => {
    setIsLoading(true);
    
    const assignedBranchId = isHqUser ? projectData.contractExecutor : user?.branchId;

    if (
      !projectData.contractNumber ||
      !projectData.rabNumber ||
      !projectData.name ||
      !projectData.client ||
      !assignedBranchId ||
      !projectData.value || projectData.value <= 0 ||
      !contractStartDate ||
      !contractEndDate
    ) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description:
          'Please fill out all required fields, including a positive value and a complete date range.',
      });
      setIsLoading(false);
      return;
    }

    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error' });
      setIsLoading(false);
      return;
    }

    const executorName = branches.find(b => b.id === assignedBranchId)?.name;
    if (!executorName) {
        toast({ variant: 'destructive', title: 'Invalid Branch' });
        setIsLoading(false);
        return;
    }

    const projectToAdd: Omit<Project, 'id'> = {
      ...projectData,
      branchId: assignedBranchId,
      contractExecutor: executorName,
      period,
      duration,
      contractStartDate,
      contractEndDate,
      serviceOrders: [],
      invoices: [],
      budgets: {},
      costs: [],
      tripApprovalWorkflow: [],
      reportApprovalWorkflow: [],
    } as Omit<Project, 'id'>; // Cast to assert all required fields are present

    try {
        await addProject(projectToAdd);
        toast({
            title: 'Project Added',
            description: `Project "${projectData.name}" has been successfully created.`,
        });
        setTimeout(() => router.push('/projects'), 500);
    } catch (error) {
        console.error("Failed to add project", error);
        toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: 'Could not save the project to the database.',
        });
    } finally {
        setIsLoading(false);
    }
  }, [addProject, branches, isHqUser, router, toast, user]);

  return <ProjectForm onSave={handleAddProject} isLoading={isLoading} />;
}
