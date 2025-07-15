
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useMemo, useCallback, useEffect } from 'react';
import { type Project } from '@/lib/data';
import * as projectService from '@/services/projectService';
import { useAuth } from './AuthContext';

type ProjectStats = {
  totalProjectValue: number;
  totalCost: number;
  totalInvoiced: number; // Invoiced + Paid
  totalPaid: number; // Paid 
  totalIncome: number; // Paid + Invoiced + net PAD + Re-invoiced
};

type ProjectContextType = {
  projects: Project[];
  setProjects: Dispatch<SetStateAction<Project[]>>; // Note: Direct setting might be limited with Firestore backend
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  getProjectById: (id: string) => Project | undefined;
  getProjectStats: (projectList: Project[]) => ProjectStats;
  projectStats: ProjectStats;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const { isInitializing } = useAuth(); // Use auth loading state to delay firestore fetch

  useEffect(() => {
    if (isInitializing) return;

    // Load from local storage first for a fast initial load
    const localProjects = projectService.loadProjectsFromLocalStorage();
    if (localProjects.length > 0) {
        setProjects(localProjects);
    }
    
    // Then, set up the real-time listener from Firestore
    const unsubscribe = projectService.streamProjects((fetchedProjects) => {
        // One-time data seeding for new users
        if (fetchedProjects.length === 0 && localProjects.length === 0) {
            projectService.seedInitialProjects();
            // The stream will automatically provide the seeded projects, so no need to set state here.
        } else {
            setProjects(fetchedProjects);
            projectService.saveProjectsToLocalStorage(fetchedProjects);
        }
    });

    return () => unsubscribe();
  }, [isInitializing]);


  const addProject = async (projectData: Omit<Project, 'id'>) => {
      await projectService.addProject(projectData);
      // State will be updated by the real-time listener
  };

  const updateProject = async (id: string, projectData: Partial<Project>) => {
      await projectService.updateProject(id, projectData);
      // State will be updated by the real-time listener
  };
  
  const getProjectById = (id: string) => {
    return projects.find(project => project.id.toString() === id);
  };


  const getProjectStats = useCallback((projectList: Project[]): ProjectStats => {
    return projectList.reduce((acc, project) => {
        acc.totalProjectValue += project.value;

        const totalCost = project.expenditures
            .filter(exp => exp.status === 'Approved')
            .reduce((sum, exp) => sum + exp.amount, 0);
        acc.totalCost += totalCost;

        // --- Standard Invoice Calculations ---
        const totalInvoicedValue = project.invoices
            .filter(inv => ['Invoiced', 'Paid'].includes(inv.status))
            .reduce((sum, inv) => sum + inv.value, 0);
        acc.totalInvoiced += totalInvoicedValue;

        const totalPaidValue = project.invoices
            .filter(inv => ['Paid'].includes(inv.status))
            .reduce((sum, inv) => sum + inv.value, 0);
        acc.totalPaid += totalPaidValue;

        // --- Advanced Income Calculation (Handling PAD) ---
        const padInvoices = project.invoices.filter(inv => inv.status === 'PAD');
        const invoicedOrPaidValuesBySO: Record<string, number> = {};

        project.invoices
            .filter(inv => ['Invoiced', 'Paid'].includes(inv.status))
            .forEach(inv => {
                invoicedOrPaidValuesBySO[inv.soNumber] = (invoicedOrPaidValuesBySO[inv.soNumber] || 0) + inv.value;
            });

        let netPadValue = 0;
        padInvoices.forEach(pad => {
            const invoicedAmountForSO = invoicedOrPaidValuesBySO[pad.soNumber] || 0;
            const remainingPad = Math.max(0, pad.value - invoicedAmountForSO);
            netPadValue += remainingPad;
        });

        const reInvoicedValue = project.invoices
            .filter(inv => inv.status === 'Re-invoiced')
            .reduce((sum, inv) => sum + inv.value, 0);

        acc.totalIncome += totalInvoicedValue + reInvoicedValue + netPadValue;

        return acc;
    }, { totalProjectValue: 0, totalCost: 0, totalInvoiced: 0, totalPaid: 0, totalIncome: 0 });
  }, []);
  
  const projectStats = useMemo(() => getProjectStats(projects), [projects, getProjectStats]);

  return (
    <ProjectContext.Provider value={{ projects, setProjects, addProject, updateProject, getProjectById, getProjectStats, projectStats }}>
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
