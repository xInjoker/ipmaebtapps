
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import { initialReports, type ReportItem, type ReportDetails, type ApprovalAction, type ReportStatus } from '@/lib/reports';
import { useProjects } from '@/context/ProjectContext'; 
import { fileToBase64 } from '@/lib/utils';
import { format } from 'date-fns';

type ReportContextType = {
  reports: ReportItem[];
  setReports: Dispatch<SetStateAction<ReportItem[]>>;
  addReport: (item: Omit<ReportItem, 'id'|'details'> & { details: Omit<ReportDetails, 'testResults'> & { testResults: any[] }}) => Promise<void>;
  updateReport: (id: string, item: Omit<ReportItem, 'details'> & { details: Omit<ReportDetails, 'testResults'> & { testResults: any[] }}) => Promise<void>;
  deleteReport: (id: string) => void;
  getReportById: (id: string) => ReportItem | undefined;
  getPendingReportApprovalsForUser: (userId: number) => ReportItem[];
};

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<ReportItem[]>(initialReports);
  const { projects } = useProjects();

  const processTestResultImages = async (testResults: any[]) => {
      return Promise.all(testResults.map(async result => {
          if (result.images && result.images.length > 0) {
              const imageUrls = await Promise.all(
                  result.images.map((file: File) => fileToBase64(file) as Promise<string>)
              );
              const { images, ...rest } = result;
              return { ...rest, imageUrls };
          }
          return result;
      }));
  };

  const addReport = useCallback(async (item: Omit<ReportItem, 'id'|'details'> & { details: Omit<ReportDetails, 'testResults'> & { testResults: any[] }}) => {
    const { details, ...rest } = item;
    const processedTestResults = await processTestResultImages(details.testResults);

    const newId = `REP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newItem = { 
        ...rest, 
        id: newId, 
        details: { ...details, testResults: processedTestResults },
    };
    setReports(prev => [...prev, newItem]);
  }, []);

  const updateReport = useCallback(async (id: string, updatedItem: Omit<ReportItem, 'id'|'details'> & { details: Omit<ReportDetails, 'testResults'> & { testResults: any[] }}) => {
    const { details, ...rest } = updatedItem;
    const processedTestResults = await processTestResultImages(details.testResults);
    
    const finalItem = { 
        ...rest, 
        id, 
        details: { ...details, testResults: processedTestResults },
    };

    setReports(prev => prev.map(item => item.id === id ? finalItem : item));
  }, []);
  
  const deleteReport = useCallback((id: string) => {
    setReports(prev => prev.filter(item => item.id !== id));
  }, []);

  const getReportById = useCallback((id: string) => {
    return reports.find(item => item.id === id);
  }, [reports]);

  const getPendingReportApprovalsForUser = useCallback((userId: number) => {
    return reports.filter(report => {
        if (report.status !== 'Submitted' && report.status !== 'Reviewed') return false;
        
        const project = projects.find(p => p.name === report.details?.project);
        if (!project?.reportApprovalWorkflow || project.reportApprovalWorkflow.length === 0) return false;

        const approvalActions = report.approvalHistory.filter(h => ['Submitted', 'Reviewed', 'Approved'].includes(h.status));
        const currentApprovalCount = approvalActions.length - 1; // Subtract 1 for the initial "Submitted" action

        if (currentApprovalCount < 0) return false;

        const nextApproverIndex = currentApprovalCount;

        if (nextApproverIndex >= project.reportApprovalWorkflow.length) return false;

        const nextApprover = project.reportApprovalWorkflow[nextApproverIndex];
        return nextApprover.approverId === userId.toString();
    });
  }, [reports, projects]);
  
  const contextValue = useMemo(() => ({
    reports,
    setReports,
    addReport,
    updateReport,
    deleteReport,
    getReportById,
    getPendingReportApprovalsForUser,
  }), [reports, addReport, updateReport, deleteReport, getReportById, getPendingReportApprovalsForUser]);

  return (
    <ReportContext.Provider value={contextValue}>
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
