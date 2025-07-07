
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { initialReports, type ReportItem, type ApprovalAction, type ReportStatus } from '@/lib/reports';

type ReportContextType = {
  reports: ReportItem[];
  setReports: Dispatch<SetStateAction<ReportItem[]>>;
  addReport: (item: Omit<ReportItem, 'id'>) => void;
  updateReport: (id: string, item: ReportItem) => void;
  deleteReport: (id: string) => void;
  getReportById: (id: string) => ReportItem | undefined;
  assignApproversAndSubmit: (reportIds: string[], reviewerId: string, approverId: string, actorName: string, actorRole: string) => void;
};

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<ReportItem[]>(initialReports);

  const addReport = (item: Omit<ReportItem, 'id'>) => {
    const newId = `REP-${String(reports.length + 1).padStart(3, '0')}`;
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
  
  const assignApproversAndSubmit = (reportIds: string[], reviewerId: string, approverId: string, actorName: string, actorRole: string) => {
    setReports(prevReports => {
      const updatedReports = prevReports.map(report => {
        if (reportIds.includes(report.id)) {
          const newHistoryEntry: ApprovalAction = {
            actorName: actorName,
            actorRole: actorRole,
            status: 'Submitted',
            timestamp: new Date().toISOString(),
            comments: 'Submitted for approval.'
          };
          
          const existingHistory = report.approvalHistory || [];

          return {
            ...report,
            status: 'Submitted' as ReportStatus,
            reviewerId,
            approverId,
            approvalHistory: [...existingHistory, newHistoryEntry]
          };
        }
        return report;
      });
      return updatedReports;
    });
  };

  return (
    <ReportContext.Provider value={{ reports, setReports, addReport, updateReport, deleteReport, getReportById, assignApproversAndSubmit }}>
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
