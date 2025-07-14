
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useMemo, useCallback } from 'react';
import { initialProjects, type Project } from '@/lib/data';

type ProjectStats = {
  totalProjectValue: number;
  totalCost: number;
  totalInvoiced: number; // Invoiced + Paid
  totalPaid: number; // Paid 
  totalIncome: number; // Paid + Invoiced + net PAD + Re-invoiced
};

type ProjectContextType = {
  projects: Project[];
  setProjects: Dispatch<SetStateAction<Project[]>>;
  getProjectStats: (projectList: Project[]) => ProjectStats;
  projectStats: ProjectStats;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

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
    <ProjectContext.Provider value={{ projects, setProjects, getProjectStats, projectStats }}>
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
