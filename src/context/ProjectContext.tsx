
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useMemo, useCallback, useEffect } from 'react';
import { type Project, initialProjects } from '@/lib/projects';
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

type ProjectStats = {
  totalProjectValue: number;
  totalCost: number;
  totalInvoiced: number; // Invoiced (not paid)
  totalPaid: number; // Paid 
  totalIncome: number; // Paid + Invoiced + PAD + Re-invoiced
};

type ProjectContextType = {
  projects: Project[];
  setProjects: Dispatch<SetStateAction<Project[]>>; 
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProjectById: (id: string) => Project | undefined;
  getProjectStats: (projectList: Project[]) => ProjectStats;
  projectStats: ProjectStats;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        const projectsData = querySnapshot.docs.map(doc => doc.data() as Project);
        if (projectsData.length > 0) {
            setProjects(projectsData);
        } else {
            // If the database is empty, load the initial hardcoded data.
            // This ensures the app is usable on first run.
            setProjects(initialProjects);
        }
      } catch (error) {
        console.error("Error fetching projects from Firestore: ", error);
        // Fallback to initial data on error
        setProjects(initialProjects);
      }
      setIsLoading(false);
    };

    fetchProjects();
  }, []);

  const addProject = useCallback(async (projectData: Omit<Project, 'id'>) => {
      const newId = `PROJ-${Date.now()}`;
      const newProject: Project = { id: newId, ...projectData };
      await setDoc(doc(db, 'projects', newId), newProject);
      setProjects(prev => [...prev, newProject]);
  }, []);

  const updateProject = useCallback(async (id: string, data: Partial<Project>) => {
    try {
        const projectDocRef = doc(db, 'projects', id);
        await updateDoc(projectDocRef, data);
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
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
