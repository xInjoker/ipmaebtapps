
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import { initialReports, type ReportItem, type ApprovalAction, type ReportStatus } from '@/lib/reports';
import { useProjects } from '@/context/ProjectContext'; // Assuming projects hold approval workflows

type ReportContextType = {
  reports: ReportItem[];
  setReports: Dispatch<SetStateAction<ReportItem[]>>;
  addReport: (item: Omit<ReportItem, 'id'>) => void;
  updateReport: (id: string, item: ReportItem) => void;
  deleteReport: (id: string) => void;
  getReportById: (id: string) => ReportItem | undefined;
  getPendingReportApprovalsForUser: (userId: number) => ReportItem[];
};

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<ReportItem[]>(initialReports);
  const { projects } = useProjects();

  const addReport = (item: Omit<ReportItem, 'id'>) => {
    const newId = `REP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newItem = { ...item, id: newId };
    setReports(prev => [...prev, newItem]);
  };

  const updateReport = (id: string, updatedItem: ReportItem) => {
    setReports(prev => prev.map(item => item.id === id ? updatedItem : item));
  };
  
  const deleteReport = (id: string) => {
    setReports(prev => prev.filter(item => item.id !== id));
  };

  const getReportById = (id: string) => {
    return reports.find(item => item.id === id);
  };

  const getPendingReportApprovalsForUser = useCallback((userId: number) => {
    return reports.filter(report => {
        if (report.status !== 'Submitted' && report.status !== 'Reviewed') return false;
        
        const project = projects.find(p => p.name === report.details?.project);
        if (!project?.reportApprovalWorkflow || project.reportApprovalWorkflow.length === 0) return false;

        const currentApprovalCount = report.approvalHistory.filter(h => h.status === 'Reviewed' || h.status === 'Approved').length;
        
        const nextApproverIndex = currentApprovalCount;

        if (nextApproverIndex >= project.reportApprovalWorkflow.length) return false;

        const nextApprover = project.reportApprovalWorkflow[nextApproverIndex];
        return nextApprover.approverId === userId.toString();
    });
  }, [reports, projects]);
  
  return (
    <ReportContext.Provider value={{ reports, setReports, addReport, updateReport, deleteReport, getReportById, getPendingReportApprovalsForUser }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportProvider');
  }
  return context;
}
