
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useMemo, useEffect } from 'react';
import { type Inspector } from '@/lib/inspectors';
import * as inspectorService from '@/services/inspectorService';
import { getDocumentStatus } from '@/lib/utils';
import { Users2, BadgeCheck, Clock, XCircle } from 'lucide-react';
import { useAuth } from './AuthContext';

type InspectorStats = {
    total: number;
    validCerts: number;
    expiringSoon: number;
    expired: number;
};

type InspectorContextType = {
  inspectors: Inspector[];
  setInspectors: Dispatch<SetStateAction<Inspector[]>>;
  addInspector: (item: Inspector) => Promise<void>;
  updateInspector: (id: string, item: Inspector) => Promise<void>;
  getInspectorById: (id: string) => Inspector | undefined;
  inspectorStats: InspectorStats;
  widgetData: { title: string; value: string; description: string; icon: React.ElementType; iconColor: string; shapeColor: string; }[];
};

const InspectorContext = createContext<InspectorContextType | undefined>(undefined);

export function InspectorProvider({ children }: { children: ReactNode }) {
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const { isInitializing } = useAuth();

  useEffect(() => {
    if (isInitializing) return;

    const unsubscribe = inspectorService.streamItems((fetchedItems) => {
        if (fetchedItems.length === 0 && inspectorService.loadFromLocalStorage().length === 0) {
            inspectorService.seedInitialData();
        } else {
            setInspectors(fetchedItems);
            inspectorService.saveToLocalStorage(fetchedItems);
        }
    });

    return () => unsubscribe();
  }, [isInitializing]);


  const addInspector = async (item: Inspector) => {
    await inspectorService.addItem(item);
  };
  
  const updateInspector = async (id: string, updatedItem: Inspector) => {
    await inspectorService.updateItem(id, updatedItem);
  };
  
  const getInspectorById = (id:string) => {
    return inspectors.find(item => item.id === id);
  };
  
  const inspectorStats = useMemo(() => {
    const total = inspectors.length;
    let validCerts = 0;
    const inspectorHasExpiringCert = new Set<string>();
    const inspectorHasExpiredCert = new Set<string>();

    inspectors.forEach(inspector => {
        const allDocs = [...inspector.qualifications, ...inspector.otherDocuments];
        let hasExpiring = false;
        let hasExpired = false;

        allDocs.forEach(doc => {
            const status = getDocumentStatus(doc.expirationDate);
            if (status.variant !== 'destructive') {
                validCerts++;
            }

            if (status.variant === 'destructive') {
                hasExpired = true;
            } else if (status.variant === 'yellow') {
                hasExpiring = true;
            }
        });

        if (hasExpired) {
            inspectorHasExpiredCert.add(inspector.id);
        } else if (hasExpiring) {
            inspectorHasExpiringCert.add(inspector.id);
        }
    });

    return { 
        total, 
        validCerts,
        expiringSoon: inspectorHasExpiringCert.size,
        expired: inspectorHasExpiredCert.size
    };
  }, [inspectors]);

  const widgetData = useMemo(() => [
    {
        title: 'Total Inspectors',
        value: `${inspectorStats.total}`,
        description: 'inspectors in the database',
        icon: Users2,
        iconColor: 'text-blue-500',
        shapeColor: 'text-blue-500/10',
    },
    {
        title: 'Total Valid Certificates',
        value: `${inspectorStats.validCerts}`,
        description: 'certificates are currently valid',
        icon: BadgeCheck,
        iconColor: 'text-green-500',
        shapeColor: 'text-green-500/10',
    },
    {
        title: 'Expiring Certificates',
        value: `${inspectorStats.expiringSoon}`,
        description: 'inspectors with certs expiring soon',
        icon: Clock,
        iconColor: 'text-amber-500',
        shapeColor: 'text-amber-500/10',
    },
    {
        title: 'Expired Certificates',
        value: `${inspectorStats.expired}`,
        description: 'inspectors with expired certs',
        icon: XCircle,
        iconColor: 'text-rose-500',
        shapeColor: 'text-rose-500/10',
    },
  ], [inspectorStats]);


  return (
    <InspectorContext.Provider value={{ inspectors, setInspectors, addInspector, updateInspector, getInspectorById, inspectorStats, widgetData }}>
      {children}
    </InspectorContext.Provider>
  );
}

export function useInspectors() {
  const context = useContext(InspectorContext);
  if (context === undefined) {
    throw new Error('useInspectors must be used within an InspectorProvider');
  }
  return context;
}
