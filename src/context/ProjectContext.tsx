'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { initialProjects, type Project } from '@/lib/data';

type ProjectStats = {
  totalProjectValue: number;
  totalCost: number;
  totalInvoiced: number;
  totalPaid: number;
};

type ProjectContextType = {
  projects: Project[];
  setProjects: Dispatch<SetStateAction<Project[]>>;
  getProjectStats: (projectList: Project[]) => ProjectStats;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const getProjectStats = (projectList: Project[]): ProjectStats => {
    return projectList.reduce((acc, project) => {
        acc.totalProjectValue += project.value;

        const totalCost = project.expenditures
            .filter(exp => exp.status === 'Approved')
            .reduce((sum, exp) => sum + exp.amount, 0);
        acc.totalCost += totalCost;

        const totalInvoiced = project.invoices
            .filter(inv => inv.status === 'Invoiced' || inv.status === 'Paid' || inv.status === 'PAD')
            .reduce((sum, inv) => sum + inv.value, 0);
        acc.totalInvoiced += totalInvoiced;

        const totalPaid = project.invoices
            .filter(inv => inv.status === 'Paid' || inv.status === 'PAD')
            .reduce((sum, inv) => sum + inv.value, 0);
        acc.totalPaid += totalPaid;

        return acc;
    }, { totalProjectValue: 0, totalCost: 0, totalInvoiced: 0, totalPaid: 0 });
  };


  return (
    <ProjectContext.Provider value={{ projects, setProjects, getProjectStats }}>
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
