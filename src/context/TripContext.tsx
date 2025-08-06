
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useCallback, useMemo, useEffect } from 'react';
import { type TripRequest } from '@/lib/trips';
import { useProjects } from './ProjectContext';
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

type TripContextType = {
  trips: TripRequest[];
  setTrips: Dispatch<SetStateAction<TripRequest[]>>;
  isLoading: boolean;
  addTrip: (item: TripRequest) => Promise<void>;
  updateTrip: (id: string, item: TripRequest) => Promise<void>;
  getTripById: (id: string) => TripRequest | undefined;
  getPendingTripApprovalsForUser: (userId: number) => TripRequest[];
};

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<TripRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { projects } = useProjects();

  useEffect(() => {
    const fetchTrips = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'trips'));
        const data = querySnapshot.docs.map(doc => doc.data() as TripRequest);
        setTrips(data);
      } catch (error) {
        console.error("Error fetching trips from Firestore: ", error);
      }
      setIsLoading(false);
    };
    fetchTrips();
  }, []);

  const addTrip = useCallback(async (item: TripRequest) => {
    await setDoc(doc(db, 'trips', item.id), item);
    setTrips(prev => [...prev, item]);
  }, []);
  
  const updateTrip = useCallback(async (id: string, updatedItem: TripRequest) => {
    await updateDoc(doc(db, 'trips', id), updatedItem);
    setTrips(prev => prev.map(t => t.id === id ? updatedItem : t));
  }, []);
  
  const getTripById = useCallback((id: string) => {
    return trips.find(item => item.id === id);
  }, [trips]);
  
  const getPendingTripApprovalsForUser = useCallback((userId: number) => {
    return trips.filter(trip => {
      if (trip.status !== 'Pending') return false;

      const project = projects.find(p => p.name === trip.project);
      if (!project?.tripApprovalWorkflow || project.tripApprovalWorkflow.length === 0) return false;

      const currentApprovalCount = trip.approvalHistory.filter(h => h.status === 'Approved').length;
      const nextApproverIndex = currentApprovalCount;

      if (nextApproverIndex >= project.tripApprovalWorkflow.length) return false;

      const nextApprover = project.tripApprovalWorkflow[nextApproverIndex];
      return nextApprover.approverId === userId.toString();
    });
  }, [trips, projects]);

  const contextValue = useMemo(() => ({
    trips,
    setTrips,
    isLoading,
    addTrip,
    updateTrip,
    getTripById,
    getPendingTripApprovalsForUser,
  }), [trips, isLoading, addTrip, updateTrip, getTripById, getPendingTripApprovalsForUser]);

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
