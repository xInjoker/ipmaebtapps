
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useCallback } from 'react';
import { initialTrips, type TripRequest } from '@/lib/trips';
import { useEmployees } from './EmployeeContext';
import { useProjects } from './ProjectContext';

type TripContextType = {
  trips: TripRequest[];
  setTrips: Dispatch<SetStateAction<TripRequest[]>>;
  addTrip: (item: TripRequest) => void;
  updateTrip: (id: string, item: TripRequest) => void;
  getTripById: (id: string) => TripRequest | undefined;
  getPendingTripApprovalsForUser: (userId: number) => TripRequest[];
};

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<TripRequest[]>(initialTrips);
  const { projects } = useProjects();

  const addTrip = (item: TripRequest) => {
    setTrips(prev => [...prev, item]);
  };
  
  const updateTrip = (id: string, updatedItem: TripRequest) => {
    setTrips(prev => prev.map(item => item.id === id ? updatedItem : item));
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
    <TripContext.Provider value={{ trips, setTrips, addTrip, updateTrip, getTripById, getPendingTripApprovalsForUser }}>
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
