

'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useCallback, useMemo, useEffect } from 'react';
import { type TripRequest, type TripStatus } from '@/lib/trips';
import { useProjects } from './ProjectContext';
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useAuth } from './AuthContext';

const db = getFirestore(app);

type TripContextType = {
  trips: TripRequest[];
  setTrips: Dispatch<SetStateAction<TripRequest[]>>;
  isLoading: boolean;
  addTrip: (item: TripRequest) => Promise<void>;
  updateTrip: (id: string, item: TripRequest) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  getTripById: (id: string) => TripRequest | undefined;
  getPendingTripApprovalsForUser: (userId: string) => TripRequest[];
};

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<TripRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { projects } = useProjects();
  const { user, isInitializing } = useAuth();

  useEffect(() => {
    if (isInitializing || !user) {
        setIsLoading(true);
        return;
    };

    if (projects.length === 0) {
        setIsLoading(true);
        return;
    }

    const fetchTrips = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'trips'));
        const data = querySnapshot.docs.map(doc => doc.data() as TripRequest);
        setTrips(data);
      } catch (error) {
        console.error("Error fetching trips from Firestore: ", error);
      } finally {
          setIsLoading(false);
      }
    };
    fetchTrips();
  }, [user, isInitializing, projects]);

  const addTrip = useCallback(async (item: TripRequest) => {
    await setDoc(doc(db, 'trips', item.id), item);
    setTrips(prev => [...prev, item]);
  }, []);
  
  const updateTrip = useCallback(async (id: string, updatedItem: TripRequest) => {
    await updateDoc(doc(db, 'trips', id), updatedItem);
    setTrips(prev => prev.map(t => t.id === id ? updatedItem : t));
  }, []);

  const deleteTrip = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'trips', id));
    setTrips(prev => prev.filter(item => item.id !== id));
  }, []);
  
  const getTripById = useCallback((id: string) => {
    return trips.find(item => item.id === id);
  }, [trips]);
  
  const getPendingTripApprovalsForUser = useCallback((userId: string) => {
    if (!projects || projects.length === 0) return [];
    
    return trips.filter(trip => {
      if (trip.status !== 'Pending' || !trip.project) return false;

      const project = projects.find(p => p.name === trip.project);
      if (!project?.tripApprovalWorkflow || project.tripApprovalWorkflow.length === 0) return false;

      const currentApprovalCount = trip.approvalHistory.filter(h => h.status === 'Approved').length;
      const nextApproverIndex = currentApprovalCount;

      if (nextApproverIndex >= project.tripApprovalWorkflow.length) return false;

      const nextApprover = project.tripApprovalWorkflow[nextApproverIndex];
      return nextApprover.approverId === userId;
    });
  }, [trips, projects]);

  const contextValue = useMemo(() => ({
    trips,
    setTrips,
    isLoading,
    addTrip,
    updateTrip,
    deleteTrip,
    getTripById,
    getPendingTripApprovalsForUser,
  }), [trips, isLoading, addTrip, updateTrip, deleteTrip, getTripById, getPendingTripApprovalsForUser]);

  return (
    <TripContext.Provider value={contextValue}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrips() {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrips must be used within a TripProvider');
  }
  return context;
}
