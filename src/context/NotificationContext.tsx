
'use client';

import { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getFirestore, collection, onSnapshot, addDoc, doc, updateDoc, query, where, Unsubscribe, orderBy } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

export type Notification = {
    id: string;
    userId: string;
    title: string;
    description: string;
    timestamp: string; // ISO Date string
    isRead: boolean;
    link?: string;
};

type NotificationContextType = {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
    markAsRead: (notificationId: string) => void;
    clearAll: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
    const { user } = useAuth();
    
    useEffect(() => {
        let unsubscribe: Unsubscribe | undefined;

        if (user) {
            // Removed orderBy from the query to prevent index-related errors.
            // Sorting will be handled on the client.
            const notificationsQuery = query(
                collection(db, "notifications"), 
                where("userId", "==", user.uid)
            );
            
            unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
                const fetchedNotifications = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Notification));

                // Sort the notifications on the client-side
                fetchedNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                setAllNotifications(fetchedNotifications);
            }, (error) => {
                console.error("Failed to fetch notifications from Firestore:", error);
            });
        } else {
            setAllNotifications([]);
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [user]);
    
    const unreadCount = useMemo(() => {
        return allNotifications.filter(n => !n.isRead).length;
    }, [allNotifications]);

    const addNotification = useCallback(async (notificationData: Omit<Notification, 'id'|'timestamp'|'isRead'>) => {
        const newNotificationData = {
            ...notificationData,
            timestamp: new Date().toISOString(),
            isRead: false,
        };
        try {
            await addDoc(collection(db, "notifications"), newNotificationData);
        } catch (error) {
            console.error("Failed to add notification to Firestore:", error);
        }
    }, []);

    const markAsRead = useCallback(async (notificationId: string) => {
        const notificationRef = doc(db, 'notifications', notificationId);
        try {
            await updateDoc(notificationRef, { isRead: true });
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    }, []);

    const clearAll = useCallback(() => {
       // This function is complex with Firestore security rules (batch deletes).
       // For now, it will mark all as read.
       if (user) {
           allNotifications.forEach(n => {
               if (!n.isRead) {
                   markAsRead(n.id);
               }
           });
       }
    }, [user, allNotifications, markAsRead]);

    const contextValue = useMemo(() => ({
        notifications: allNotifications,
        unreadCount,
        addNotification,
        markAsRead,
        clearAll,
    }), [allNotifications, unreadCount, addNotification, markAsRead, clearAll]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
