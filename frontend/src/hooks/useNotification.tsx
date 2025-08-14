import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Hook de conveniência para notificações comuns
export const useToast = () => {
  const { addNotification } = useNotification();

  const success = useCallback((title: string, message: string) => {
    addNotification({
      type: 'success',
      title,
      message,
    });
  }, [addNotification]);

  const error = useCallback((title: string, message: string) => {
    addNotification({
      type: 'error',
      title,
      message,
    });
  }, [addNotification]);

  const warning = useCallback((title: string, message: string) => {
    addNotification({
      type: 'warning',
      title,
      message,
    });
  }, [addNotification]);

  const info = useCallback((title: string, message: string) => {
    addNotification({
      type: 'info',
      title,
      message,
    });
  }, [addNotification]);

  return { success, error, warning, info };
};

export default useNotification;