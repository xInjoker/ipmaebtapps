
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useMemo, useCallback, useEffect } from 'react';
import { type Project, initialProjects } from '@/lib/projects';

type ProjectStats = {
  totalProjectValue: number;
  totalCost: number;
  totalInvoiced: number; // Invoiced + Paid
  totalPaid: number; // Paid 
  totalIncome: number; // Paid + Invoiced + PAD + Re-invoiced
};

type ProjectContextType = {
  projects: Project[];
  setProjects: Dispatch<SetStateAction<Project[]>>; 
  addProject: (project: Omit<Project, 'id'>) => void;
  getProjectById: (id: string) => Project | undefined;
  getProjectStats: (projectList: Project[]) => ProjectStats;
  projectStats: ProjectStats;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const addProject = useCallback((projectData: Omit<Project, 'id'>) => {
      const newProject: Project = {
          id: `PROJ-${Date.now()}`,
          ...projectData
      };
      setProjects(prev => [...prev, newProject]);
  }, []);
  
  const getProjectById = useCallback((id: string) => {
    return projects.find(project => project.id.toString() === id);
  }, [projects]);

  const getProjectStats = useCallback((projectList: Project[]): ProjectStats => {
    return projectList.reduce((acc, project) => {
        acc.totalProjectValue += project.value || 0;

        const costs = project.costs || [];
        const invoices = project.invoices || [];

        const totalCost = costs
            .filter(exp => exp.status === 'Approved')
            .reduce((sum, exp) => sum + exp.amount, 0);
        acc.totalCost += totalCost;

        const totalInvoicedValue = invoices
            .filter(inv => ['Invoiced', 'Paid'].includes(inv.status))
            .reduce((sum, inv) => sum + inv.value, 0);
        acc.totalInvoiced += totalInvoicedValue;

        const totalPaidValue = invoices
            .filter(inv => ['Paid'].includes(inv.status))
            .reduce((sum, inv) => sum + inv.value, 0);
        acc.totalPaid += totalPaidValue;

        // Updated income calculation
        const totalIncomeValue = invoices
            .filter(inv => ['Paid', 'Invoiced', 'PAD', 'Re-invoiced'].includes(inv.status))
            .reduce((sum, inv) => sum + inv.value, 0);
        acc.totalIncome += totalIncomeValue;

        return acc;
    }, { totalProjectValue: 0, totalCost: 0, totalInvoiced: 0, totalPaid: 0, totalIncome: 0 });
  }, []);
  
  const projectStats = useMemo(() => getProjectStats(projects), [projects, getProjectStats]);

  const contextValue = useMemo(() => ({
    projects,
    setProjects,
    addProject,
    getProjectById,
    getProjectStats,
    projectStats,
  }), [projects, addProject, getProjectById, getProjectStats, projectStats]);

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}
