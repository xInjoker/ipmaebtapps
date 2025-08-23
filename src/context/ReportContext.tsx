

'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useCallback, useMemo, useEffect } from 'react';
import { type ReportItem, type ReportDetails, FlashReportDetails, type InspectionReportDetails, RadiographicTestReportDetails } from '@/lib/reports';
import { useProjects } from '@/context/ProjectContext'; 
import { fileToBase64 } from '@/lib/utils';
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { uploadFile, deleteFileByUrl } from '@/lib/storage';
import { useAuth } from './AuthContext';

const db = getFirestore(app);

type ReportContextType = {
  reports: ReportItem[];
  setReports: Dispatch<SetStateAction<ReportItem[]>>;
  addReport: (item: Omit<ReportItem, 'id'|'details'|'approvalHistory'> & { details: Omit<ReportDetails, 'testResults'|'documentUrls'> & { testResults?: any[], documents?: File[] }}) => Promise<void>;
  updateReport: (id: string, item: ReportItem, newFiles?: { testResults?: any[] }) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  getReportById: (id: string) => ReportItem | undefined;
  getPendingReportApprovalsForUser: (userId: string) => ReportItem[];
};

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const { projects } = useProjects();
  const [isLoading, setIsLoading] = useState(true);
  const { user, roles, users, isInitializing } = useAuth();

  useEffect(() => {
    if (isInitializing || !user || projects.length === 0 || users.length === 0) {
        setIsLoading(true);
        return;
    };

    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'reports'));
        const data = querySnapshot.docs.map(doc => doc.data() as ReportItem);
        setReports(data);
      } catch (error) {
        console.error("Error fetching reports from Firestore: ", error);
      } finally {
          setIsLoading(false);
      }
    };
    fetchReports();
  }, [user, isInitializing, projects, users]);

  const processTestResultImages = async (reportId: string, testResults: any[]) => {
      return Promise.all((testResults || []).map(async (result, index) => {
          const newImageFiles: File[] = result.images || [];
          const existingImageUrls: string[] = (result.imageUrls || []).filter((url: any) => typeof url === 'string' && !url.startsWith('blob:'));
          
          const uploadedImageUrls = await Promise.all(
              newImageFiles.map(file => uploadFile(file, `reports/${reportId}/results/${result.jointNo || index}/${file.name}`))
          );
          
          const { images, ...rest } = result;
          
          return { ...rest, imageUrls: [...existingImageUrls, ...uploadedImageUrls] };
      }));
  };

  const addReport = useCallback(async (item: Omit<ReportItem, 'id'|'details'|'approvalHistory'> & { details: Omit<ReportDetails, 'documentUrls'> & { testResults?: any[], documents?: File[] }}) => {
    if (!user) return;
    
    const newId = `REP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const { details, ...rest } = item;
    const processedTestResults = await processTestResultImages(newId, details.testResults || []);
    let processedDetails: ReportDetails;

    if (details.jobType === 'Flash Report' || details.jobType === 'Inspection Report') {
        const docUrls = await Promise.all(
            (details.documents || []).map(file => uploadFile(file, `reports/${newId}/qms/${file.name}`))
        );
        const { documents, ...restOfDetails } = details;
        processedDetails = { 
            ...restOfDetails, 
            documentUrls: docUrls,
            testResults: processedTestResults 
        } as FlashReportDetails | InspectionReportDetails;
    } else {
        processedDetails = { ...details, testResults: processedTestResults } as ReportDetails;
    }
    
    const userRole = roles.find(r => r.id === user.roleId)?.name || 'N/A';
    
    const newItem: ReportItem = { 
        ...rest, 
        id: newId, 
        details: processedDetails,
        approvalHistory: [{
            actorName: user.name,
            actorRole: userRole,
            status: 'Submitted',
            timestamp: new Date().toISOString(),
            comments: 'Report created.'
        }]
    };
    
    await setDoc(doc(db, 'reports', newId), newItem);
    setReports(prev => [...prev, newItem]);
  }, [user, roles]);

  const updateReport = useCallback(async (id: string, updatedItem: ReportItem, newFiles?: { testResults?: any[] }) => {
    let finalDetails = updatedItem.details;

    if (newFiles?.testResults && finalDetails) {
        const processedTestResults = await processTestResultImages(id, newFiles.testResults);
        finalDetails = { ...finalDetails, testResults: processedTestResults };
    }
    
    const finalItem = { ...updatedItem, details: finalDetails };

    await updateDoc(doc(db, 'reports', id), finalItem);
    setReports(prev => prev.map(item => item.id === id ? finalItem : item));
  }, []);
  
  const deleteReport = useCallback(async (id: string) => {
    const reportDocRef = doc(db, 'reports', id);
    try {
        const docSnap = await getDoc(reportDocRef);
        if (docSnap.exists()) {
            const reportData = docSnap.data() as ReportItem;
            const urlsToDelete: string[] = [];

            if (reportData.details?.jobType === 'Flash Report' || reportData.details?.jobType === 'Inspection Report') {
                (reportData.details.documentUrls || []).forEach(url => urlsToDelete.push(url));
            } else if (reportData.details?.testResults) {
                (reportData.details.testResults as any[]).forEach(result => {
                    (result.imageUrls || []).forEach((url: string) => urlsToDelete.push(url));
                });
            }

            if (urlsToDelete.length > 0) {
                await Promise.all(urlsToDelete.map(url => deleteFileByUrl(url)));
            }
        }

        await deleteDoc(reportDocRef);
        setReports(prev => prev.filter(item => item.id !== id));
    } catch (error) {
        console.error("Error deleting report:", error);
    }
  }, []);

  const getReportById = useCallback((id: string) => {
    return reports.find(item => item.id === id);
  }, [reports]);

  const getPendingReportApprovalsForUser = useCallback((userId: string) => {
    if (!projects || projects.length === 0 || !users || users.length === 0) {
        return [];
    }

    return reports.filter(report => {
        if (report.status !== 'Submitted' && report.status !== 'Reviewed') return false;
        
        if (!report.details || !report.details.project) return false;

        const project = projects.find(p => p.name === report.details!.project);
        if (!project?.reportApprovalWorkflow || project.reportApprovalWorkflow.length === 0) return false;

        const approvalActions = report.approvalHistory.filter(h => ['Submitted', 'Reviewed', 'Approved'].includes(h.status));
        const currentApprovalCount = approvalActions.length - 1; 

        if (currentApprovalCount < 0) return false;

        const nextApproverIndex = currentApprovalCount;

        if (nextApproverIndex >= project.reportApprovalWorkflow.length) return false;

        const nextApprover = project.reportApprovalWorkflow[nextApproverIndex];
        return nextApprover.approverId === userId;
    });
  }, [reports, projects, users]);
  
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
