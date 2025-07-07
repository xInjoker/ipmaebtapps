
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { initialReports, type ReportItem } from '@/lib/reports';

type ReportContextType = {
  reports: ReportItem[];
  setReports: Dispatch<SetStateAction<ReportItem[]>>;
  addReport: (item: Omit<ReportItem, 'id'>) => void;
};

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<ReportItem[]>(initialReports);

  const addReport = (item: Omit<ReportItem, 'id'>) => {
    const newId = `REP-${String(reports.length + 1).padStart(3, '0')}`;
    const newItem = { ...item, id: newId };
    setReports(prev => [...prev, newItem]);
  };

  return (
    <ReportContext.Provider value={{ reports, setReports, addReport }}>
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
