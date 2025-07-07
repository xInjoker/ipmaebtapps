
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { initialReports, type ReportItem } from '@/lib/reports';

type ReportContextType = {
  reports: ReportItem[];
  setReports: Dispatch<SetStateAction<ReportItem[]>>;
  addReport: (item: Omit<ReportItem, 'id'>) => void;
  updateReport: (id: string, item: ReportItem) => void;
  deleteReport: (id: string) => void;
  getReportById: (id: string) => ReportItem | undefined;
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

  return (
    <ReportContext.Provider value={{ reports, setReports, addReport, updateReport, deleteReport, getReportById }}>
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
