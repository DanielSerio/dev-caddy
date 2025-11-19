import { createContext } from 'react';

/**
 * Notification type
 */
export type NotificationType = 'error' | 'success' | 'info';

/**
 * Notification object
 */
export interface Notification {
  /** Unique identifier for this notification */
  id: string;
  /** Type of notification (determines styling) */
  type: NotificationType;
  /** Message to display to the user */
  message: string;
  /** Timestamp when notification was created */
  timestamp: number;
}

/**
 * Context value for notification system
 */
export interface NotificationContextValue {
  /** Array of current notifications */
  notifications: Notification[];
  /** Show a new notification */
  notify: (type: NotificationType, message: string) => void;
  /** Dismiss a specific notification by ID */
  dismiss: (id: string) => void;
  /** Clear all notifications */
  clearAll: () => void;
}

/**
 * React Context for notification system
 *
 * Provides a centralized notification system for showing
 * success, error, and info messages to users.
 */
export const NotificationContext = createContext<NotificationContextValue | null>(
  null
);
