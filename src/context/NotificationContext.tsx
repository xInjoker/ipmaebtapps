
'use client';

import { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type Notification = {
    id: string;
    userId: number;
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
    
    // Load notifications from localStorage on initial load
    useEffect(() => {
        try {
            const storedNotifications = localStorage.getItem('notifications');
            if (storedNotifications) {
                setAllNotifications(JSON.parse(storedNotifications));
            }
        } catch (error) {
            console.error("Failed to load notifications from localStorage", error);
        }
    }, []);

    // Persist notifications to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('notifications', JSON.stringify(allNotifications));
        } catch (error) {
            console.error("Failed to save notifications to localStorage", error);
        }
    }, [allNotifications]);
    
    const notificationsForCurrentUser = useMemo(() => {
        if (!user) return [];
        return allNotifications
            .filter(n => n.userId === user.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [allNotifications, user]);
    
    const unreadCount = useMemo(() => {
        return notificationsForCurrentUser.filter(n => !n.isRead).length;
    }, [notificationsForCurrentUser]);

    const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
        const newNotification: Notification = {
            id: `NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            timestamp: new Date().toISOString(),
            isRead: false,
            ...notificationData
        };
        setAllNotifications(prev => [newNotification, ...prev]);
    }, []);

    const markAsRead = useCallback((notificationId: string) => {
        setAllNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    }, []);

    const clearAll = useCallback(() => {
        if (user) {
            setAllNotifications(prev => prev.filter(n => n.userId !== user.id));
        }
    }, [user]);

    const contextValue = useMemo(() => ({
        notifications: notificationsForCurrentUser,
        unreadCount,
        addNotification,
        markAsRead,
        clearAll,
    }), [notificationsForCurrentUser, unreadCount, addNotification, markAsRead, clearAll]);

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
