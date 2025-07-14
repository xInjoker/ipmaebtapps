
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useCallback } from 'react';
import { initialTrips, type TripRequest } from '@/lib/trips';
import { useEmployees } from './EmployeeContext'; // Needed to find manager

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
  const { employees } = useEmployees();

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
    // This logic is simplified. A real app would use the project-based workflow.
    return trips.filter(trip => {
        if (trip.status !== 'Pending') return false;
        
        // Get the employee who requested the trip
        const requestingEmployee = employees.find(e => e.id === trip.employeeId.toString());
        if (!requestingEmployee?.reportingManagerId) return false;

        // For now, the first approver is always the direct manager.
        const nextApproverId = requestingEmployee.reportingManagerId;
        const currentApprovalCount = trip.approvalHistory.filter(h => h.status === 'Approved').length;

        // Only show if the current user is the next approver and it's the first approval step
        return nextApproverId === userId.toString() && currentApprovalCount === 0;
    });
  }, [trips, employees]);

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
