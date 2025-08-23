

'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useMemo, useCallback, useEffect } from 'react';
import { type Project, type ProjectDocument } from '@/lib/projects';
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { uploadFile } from '@/lib/storage';

const db = getFirestore(app);

type ProjectStats = {
  totalProjectValue: number;
  totalCost: number;
  totalInvoiced: number; // Invoiced (not paid)
  totalPaid: number; // Paid 
  totalIncome: number; // Paid + Invoiced + PAD + Re-invoiced
};

type NewDocs = {
  contractFile: File | null;
  rabFile: File | null;
  otherFiles: File[];
};

type ProjectContextType = {
  projects: Project[];
  setProjects: Dispatch<SetStateAction<Project[]>>; 
  addProject: (project: Omit<Project, 'id'> & NewDocs) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>, newDocs?: NewDocs) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProjectById: (id: string) => Project | undefined;
  getProjectStats: (projectList: Project[]) => ProjectStats;
  projectStats: ProjectStats;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isInitializing } = useAuth();

  useEffect(() => {
    if (isInitializing || !user) {
        setIsLoading(true);
        return;
    };
    
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        const projectsData = querySnapshot.docs.map(doc => doc.data() as Project);
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching projects from Firestore: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [user, isInitializing]);

  const addProject = useCallback(async (projectData: Omit<Project, 'id'> & NewDocs) => {
      const { contractFile, rabFile, otherFiles, ...restOfProjectData } = projectData;
      const newId = `PROJ-${Date.now()}`;
      
      const contractUrl = contractFile ? await uploadFile(contractFile, `projects/${newId}/contract/${contractFile.name}`) : undefined;
      const rabUrl = rabFile ? await uploadFile(rabFile, `projects/${newId}/rab/${rabFile.name}`) : undefined;
      
      const otherDocumentUrls: ProjectDocument[] = await Promise.all(
        otherFiles.map(async file => ({
            name: file.name,
            url: await uploadFile(file, `projects/${newId}/other/${file.name}`),
        }))
      );

      const newProject: Project = { 
        id: newId, 
        ...restOfProjectData,
        contractUrl,
        rabUrl,
        otherDocumentUrls,
      };

      await setDoc(doc(db, 'projects', newId), newProject);
      setProjects(prev => [...prev, newProject]);
  }, []);

  const updateProject = useCallback(async (id: string, data: Partial<Project>, newDocs: NewDocs = { contractFile: null, rabFile: null, otherFiles: [] }) => {
    try {
        const { contractFile, rabFile, otherFiles } = newDocs;
        const updateData: Partial<Project> = { ...data };

        if (contractFile) {
            updateData.contractUrl = await uploadFile(contractFile, `projects/${id}/contract/${contractFile.name}`);
        }
        if (rabFile) {
            updateData.rabUrl = await uploadFile(rabFile, `projects/${id}/rab/${rabFile.name}`);
        }
        if (otherFiles.length > 0) {
            const newOtherUrls = await Promise.all(
                otherFiles.map(async file => ({
                    name: file.name,
                    url: await uploadFile(file, `projects/${id}/other/${file.name}`),
                }))
            );
            updateData.otherDocumentUrls = [...(data.otherDocumentUrls || []), ...newOtherUrls];
        }

        const projectDocRef = doc(db, 'projects', id);
        await updateDoc(projectDocRef, updateData);
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updateData } as Project : p));
    } catch (error) {
        console.error("Error updating project in Firestore: ", error);
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'projects', id));
    setProjects(prev => prev.filter(item => item.id !== id));
  }, []);
  
  const getProjectById = useCallback((id: string) => {
    return projects.find(project => project.id.toString() === id);
  }, [projects]);

  const getProjectStats = useCallback((projectList: Project[]): ProjectStats => {
    return projectList.reduce((acc, project) => {
        acc.totalProjectValue += project.value || 0;

        const costs = project.costs || [];
        const invoices = project.invoices || [];

        const totalCost = costs
            .filter(exp => exp.status === 'Approved')
            .reduce((sum, exp) => sum + exp.amount, 0);
        acc.totalCost += totalCost;

        const totalInvoicedValue = invoices
            .filter(inv => ['Invoiced', 'Re-invoiced'].includes(inv.status))
            .reduce((sum, inv) => sum + inv.value, 0);
        acc.totalInvoiced += totalInvoicedValue;

        const totalPaidValue = invoices
            .filter(inv => inv.status === 'Paid')
            .reduce((sum, inv) => sum + inv.value, 0);
        acc.totalPaid += totalPaidValue;

        const totalIncomeValue = invoices
            .filter(inv => ['Paid', 'Invoiced', 'PAD', 'Re-invoiced'].includes(inv.status))
            .reduce((sum, inv) => sum + inv.value, 0);
        acc.totalIncome += totalIncomeValue;

        return acc;
    }, { totalProjectValue: 0, totalCost: 0, totalInvoiced: 0, totalPaid: 0, totalIncome: 0 });
  }, []);
  
  const projectStats = useMemo(() => getProjectStats(projects), [projects, getProjectStats]);

  const contextValue = useMemo(() => ({
    projects,
    setProjects,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    getProjectStats,
    projectStats,
  }), [projects, addProject, updateProject, deleteProject, getProjectById, getProjectStats, projectStats]);

  return (
    <ProjectContext.Provider value={contextValue}>
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
