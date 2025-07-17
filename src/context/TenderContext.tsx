
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useMemo, useEffect } from 'react';
import { type Tender, type TenderStatus } from '@/lib/tenders';
import { formatCurrencyMillions } from '@/lib/utils';
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import * as tenderService from '@/services/tenderService';
import { useAuth } from './AuthContext';

type TenderStats = {
  totalTenders: { count: number; value: number };
  inProgress: { count: number; value: number };
  awarded: { count: number; value: number };
  lostOrCancelled: { count: number; value: number };
};

type TenderContextType = {
  tenders: Tender[];
  setTenders: Dispatch<SetStateAction<Tender[]>>;
  addTender: (item: Tender) => Promise<void>;
  updateTender: (id: string, item: Tender) => Promise<void>;
  getTenderById: (id: string) => Tender | undefined;
  tenderStats: TenderStats;
  widgetData: { title: string; value: string; description: string; icon: React.ElementType; iconColor: string; shapeColor: string; }[];
};

const TenderContext = createContext<TenderContextType | undefined>(undefined);

export function TenderProvider({ children }: { children: ReactNode }) {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const { isInitializing } = useAuth();

  useEffect(() => {
    if (isInitializing) return;

    const unsubscribe = tenderService.streamItems((fetchedItems) => {
        if (fetchedItems.length === 0 && tenderService.loadFromLocalStorage().length === 0) {
            tenderService.seedInitialData();
        } else {
            setTenders(fetchedItems);
            tenderService.saveToLocalStorage(fetchedItems);
        }
    });

    return () => unsubscribe();
  }, [isInitializing]);


  const addTender = async (item: Tender) => {
    await tenderService.addItem(item);
  };

  const updateTender = async (id: string, updatedItem: Tender) => {
    await tenderService.updateItem(id, updatedItem);
  };

  const getTenderById = (id: string) => {
    return tenders.find(item => item.id === id);
  };
  
  const tenderStats = useMemo(() => {
    const initialStats = {
      count: 0,
      value: 0,
    };
  
    const statusMetrics = tenders.reduce((acc, tender) => {
      const status = tender.status;
      if (!acc[status]) {
        acc[status] = { count: 0, value: 0 };
      }
      acc[status].count += 1;
      acc[status].value += tender.bidPrice;
      return acc;
    }, {} as Record<TenderStatus, { count: number; value: number }>);
  
    const inProgressStatuses: TenderStatus[] = ['Aanwijzing', 'Bidding', 'Evaluation', 'Prequalification'];
    const lostCancelledStatuses: TenderStatus[] = ['Lost', 'Cancelled'];
  
    const getAggregatedStats = (statuses: TenderStatus[]) => {
      return statuses.reduce((acc, status) => {
        const metric = statusMetrics[status] || initialStats;
        acc.count += metric.count;
        acc.value += metric.value;
        return acc;
      }, { count: 0, value: 0 });
    };
  
    return {
      totalTenders: {
        count: tenders.length,
        value: tenders.reduce((sum, t) => sum + t.bidPrice, 0),
      },
      inProgress: getAggregatedStats(inProgressStatuses),
      awarded: statusMetrics['Awarded'] || initialStats,
      lostOrCancelled: getAggregatedStats(lostCancelledStatuses),
    };
  }, [tenders]);
  
   const widgetData = useMemo(() => [
    {
      title: 'Total Tenders',
      value: `${formatCurrencyMillions(tenderStats.totalTenders.value)}`,
      description: `${tenderStats.totalTenders.count} total tenders`,
      icon: Users,
      iconColor: 'text-blue-500',
      shapeColor: 'text-blue-500/10',
    },
    {
      title: 'In Progress',
      value: `${formatCurrencyMillions(tenderStats.inProgress.value)}`,
      description: `${tenderStats.inProgress.count} active tenders`,
      icon: Clock,
      iconColor: 'text-amber-500',
      shapeColor: 'text-amber-500/10',
    },
    {
      title: 'Awarded',
      value: `${formatCurrencyMillions(tenderStats.awarded.value)}`,
      description: `${tenderStats.awarded.count} won tenders`,
      icon: CheckCircle,
      iconColor: 'text-green-500',
      shapeColor: 'text-green-500/10',
    },
    {
      title: 'Lost / Cancelled',
      value: `${formatCurrencyMillions(tenderStats.lostOrCancelled.value)}`,
      description: `${tenderStats.lostOrCancelled.count} lost or cancelled`,
      icon: XCircle,
      iconColor: 'text-rose-500',
      shapeColor: 'text-rose-500/10',
    },
  ], [tenderStats]);

  return (
    <TenderContext.Provider value={{ tenders, setTenders, addTender, updateTender, getTenderById, tenderStats, widgetData }}>
      {children}
    </TenderContext.Provider>
  );
}

export function useTenders() {
  const context = useContext(TenderContext);
  if (context === undefined) {
    throw new Error('useTenders must be used within a TenderProvider');
  }
  return context;
}
