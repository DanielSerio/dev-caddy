import { useState, useCallback, type ReactNode } from 'react';
import {
  NotificationContext,
  type Notification,
  type NotificationType,
  type NotificationContextValue,
} from './NotificationContext';

/**
 * Props for NotificationProvider
 */
interface NotificationProviderProps {
  /** Child components */
  children: ReactNode;
  /** Duration in milliseconds before auto-dismissing notifications (default: 5000) */
  autoDismissMs?: number;
}

/**
 * Generate a unique ID for a notification
 */
function generateId(): string {
  return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Notification provider component
 *
 * Manages notification state and provides methods to show/dismiss notifications.
 * Notifications are automatically dismissed after a configurable timeout.
 *
 * @example
 * ```typescript
 * <NotificationProvider autoDismissMs={5000}>
 *   <YourApp />
 * </NotificationProvider>
 * ```
 */
export function NotificationProvider({
  children,
  autoDismissMs = 5000,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /**
   * Show a new notification
   */
  const notify = useCallback(
    (type: NotificationType, message: string) => {
      const notification: Notification = {
        id: generateId(),
        type,
        message,
        timestamp: Date.now(),
      };

      setNotifications((prev) => [...prev, notification]);

      // Auto-dismiss after timeout
      if (autoDismissMs > 0) {
        setTimeout(() => {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== notification.id)
          );
        }, autoDismissMs);
      }
    },
    [autoDismissMs]
  );

  /**
   * Dismiss a specific notification
   */
  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextValue = {
    notifications,
    notify,
    dismiss,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
