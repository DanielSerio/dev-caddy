import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

/**
 * Hook to access the notification system
 *
 * Provides methods to show, dismiss, and manage notifications.
 * Must be used within a NotificationProvider.
 *
 * @returns Notification context value with notify, dismiss, and clearAll methods
 * @throws {Error} If used outside of NotificationProvider
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { notify } = useNotification();
 *
 *   const handleSubmit = async () => {
 *     try {
 *       await submitForm();
 *       notify('success', 'Form submitted successfully!');
 *     } catch (err) {
 *       notify('error', 'Failed to submit form. Please try again.');
 *     }
 *   };
 *
 *   return <button onClick={handleSubmit}>Submit</button>;
 * }
 * ```
 */
export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    );
  }

  return context;
}
