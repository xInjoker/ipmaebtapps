
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { initialTrips, type TripRequest } from '@/lib/trips';

type TripContextType = {
  trips: TripRequest[];
  setTrips: Dispatch<SetStateAction<TripRequest[]>>;
  addTrip: (item: TripRequest) => void;
  updateTrip: (id: string, item: TripRequest) => void;
  getTripById: (id: string) => TripRequest | undefined;
};

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<TripRequest[]>(initialTrips);

  const addTrip = (item: TripRequest) => {
    setTrips(prev => [...prev, item]);
  };
  
  const updateTrip = (id: string, updatedItem: TripRequest) => {
    setTrips(prev => prev.map(item => item.id === id ? updatedItem : item));
  };
  
  const getTripById = (id: string) => {
    return trips.find(item => item.id === id);
  };

  return (
    <TripContext.Provider value={{ trips, setTrips, addTrip, updateTrip, getTripById }}>
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
