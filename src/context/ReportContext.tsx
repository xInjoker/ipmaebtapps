
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useCallback, useMemo, useEffect } from 'react';
import { type ReportItem, type ReportDetails, FlashReportDetails, type InspectionReportDetails } from '@/lib/reports';
import { useProjects } from '@/context/ProjectContext'; 
import { fileToBase64 } from '@/lib/utils';
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

type ReportContextType = {
  reports: ReportItem[];
  setReports: Dispatch<SetStateAction<ReportItem[]>>;
  addReport: (item: Omit<ReportItem, 'id'|'details'> & { details: Omit<ReportDetails, 'testResults'|'documentUrls'> & { testResults?: any[], documents?: File[] }}) => Promise<void>;
  updateReport: (id: string, item: ReportItem) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  getReportById: (id: string) => ReportItem | undefined;
  getPendingReportApprovalsForUser: (userId: number) => ReportItem[];
};

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const { projects } = useProjects();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'reports'));
        const data = querySnapshot.docs.map(doc => doc.data() as ReportItem);
        setReports(data);
      } catch (error) {
        console.error("Error fetching reports from Firestore: ", error);
      }
      setIsLoading(false);
    };
    fetchReports();
  }, []);

  const processTestResultImages = async (testResults: any[]) => {
      return Promise.all((testResults || []).map(async result => {
          if (result.images && result.images.length > 0) {
              const imageUrls = await Promise.all(
                  result.images.map((file: File) => fileToBase64(file) as Promise<string>)
              );
              const { images, ...rest } = result;
              return { ...rest, imageUrls: [...(result.imageUrls || []), ...imageUrls] };
          }
          return result;
      }));
  };

  const addReport = useCallback(async (item: Omit<ReportItem, 'id'|'details'> & { details: Omit<ReportDetails, 'testResults'|'documentUrls'> & { testResults?: any[], documents?: File[] }}) => {
    const { details, ...rest } = item;
    const processedTestResults = await processTestResultImages(details.testResults || []);
    let processedDetails: ReportDetails;

    if (details.jobType === 'Flash Report' || details.jobType === 'Inspection Report') {
        const docUrls = await Promise.all(
            (details.documents || []).map(async file => {
                const base64 = await fileToBase64(file) as string;
                const parts = base64.split(';base64,');
                const newMimePart = `${parts[0]};name=${encodeURIComponent(file.name)}`;
                return `${newMimePart};base64,${parts[1]}`;
            })
        );
        processedDetails = { 
            ...details, 
            documentUrls: docUrls,
            testResults: processedTestResults 
        } as FlashReportDetails | InspectionReportDetails;
    } else {
        processedDetails = { ...details, testResults: processedTestResults } as ReportDetails;
    }

    const newId = `REP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newItem: ReportItem = { ...rest, id: newId, details: processedDetails };
    
    await setDoc(doc(db, 'reports', newId), newItem);
    setReports(prev => [...prev, newItem]);
  }, []);

  const updateReport = useCallback(async (id: string, updatedItem: ReportItem) => {
    await updateDoc(doc(db, 'reports', id), updatedItem);
    setReports(prev => prev.map(item => item.id === id ? updatedItem : item));
  }, []);
  
  const deleteReport = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'reports', id));
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
        const currentApprovalCount = approvalActions.length - 1; 

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
