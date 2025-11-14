/**
 * Custom React hooks for DevCaddy UI
 */

// Element selection and authentication
export { useElementSelector, type SelectionMode } from './useElementSelector';
export { useAuth, sendMagicLink, signOut, type AuthState } from './useAuth';

// Position and visibility tracking
export { useThrottledPosition } from './useThrottledPosition';
export { useScrollableParents } from './useScrollableParents';
export { useElementVisibility } from './useElementVisibility';
export { useElementPosition, type Position, type PositionOptions } from './useElementPosition';

// Navigation
export { useAnnotationNavigation, type AnnotationNavigationHandlers } from './useAnnotationNavigation';

// Form utilities
export { useFormKeyboardShortcuts, type KeyboardShortcutHandlers } from './useFormKeyboardShortcuts';
