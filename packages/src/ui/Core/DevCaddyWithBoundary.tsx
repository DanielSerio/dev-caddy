import { DevCaddy } from './DevCaddy';
import { ErrorBoundary } from './ErrorBoundary';
import type { DevCaddyProps } from '../../types';

/**
 * DevCaddy component wrapped with Error Boundary
 *
 * This is the main export that users should use. It catches any errors
 * in the DevCaddy component tree and displays a user-friendly error message.
 *
 * @example
 * <DevCaddyWithBoundary corner="bottom-right" offset={48} />
 */
export function DevCaddyWithBoundary(props: DevCaddyProps) {
  return (
    <ErrorBoundary>
      <DevCaddy {...props} />
    </ErrorBoundary>
  );
}
