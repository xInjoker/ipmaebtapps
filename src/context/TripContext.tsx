
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useCallback } from 'react';
import { type TripRequest, initialTrips } from '@/lib/trips';
import { useProjects } from './ProjectContext';

type TripContextType = {
  trips: TripRequest[];
  setTrips: Dispatch<SetStateAction<TripRequest[]>>;
  isLoading: boolean;
  addTrip: (item: TripRequest) => void;
  updateTrip: (id: string, item: TripRequest) => void;
  getTripById: (id: string) => TripRequest | undefined;
  getPendingTripApprovalsForUser: (userId: number) => TripRequest[];
};

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<TripRequest[]>(
    initialTrips.map((t, index) => ({ ...t, id: `TRIP-${String(index + 1).padStart(3, '0')}`}))
  );
  const [isLoading, setIsLoading] = useState(false);
  const { projects } = useProjects();

  const addTrip = (item: TripRequest) => {
    setTrips(prev => [...prev, item]);
  };
  
  const updateTrip = (id: string, updatedItem: TripRequest) => {
    setTrips(prev => prev.map(t => t.id === id ? updatedItem : t));
  };
  
  const getTripById = (id: string) => {
    return trips.find(item => item.id === id);
  };
  
  const getPendingTripApprovalsForUser = useCallback((userId: number) => {
    return trips.filter(trip => {
      if (trip.status !== 'Pending') return false;

      const project = projects.find(p => p.name === trip.project);
      if (!project?.tripApprovalWorkflow || project.tripApprovalWorkflow.length === 0) return false;

      // Count only 'Approved' actions, as 'Pending' is the current state
      const currentApprovalCount = trip.approvalHistory.filter(h => h.status === 'Approved').length;
      
      const nextApproverIndex = currentApprovalCount;

      if (nextApproverIndex >= project.tripApprovalWorkflow.length) return false;

      const nextApprover = project.tripApprovalWorkflow[nextApproverIndex];
      return nextApprover.approverId === userId.toString();
    });
  }, [trips, projects]);

  return (
    <TripContext.Provider value={{ trips, setTrips, isLoading, addTrip, updateTrip, getTripById, getPendingTripApprovalsForUser }}>
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
