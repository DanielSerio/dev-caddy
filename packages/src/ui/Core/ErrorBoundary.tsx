import { Component, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * Optional callback when an error is caught
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component for DevCaddy
 *
 * Catches errors in the DevCaddy component tree and displays a user-friendly
 * error message with the option to reset the component.
 *
 * @example
 * <ErrorBoundary>
 *   <DevCaddy />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details to console
    console.error('DevCaddy Error Boundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="dev-caddy-error-boundary"
          data-dev-caddy
          data-testid="error-boundary"
          style={{
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            maxWidth: '400px',
            padding: '20px',
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '8px',
            color: '#721c24',
            fontSize: '14px',
            lineHeight: '1.5',
            zIndex: 999999,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            DevCaddy Error
          </h3>
          <p style={{ margin: '0 0 12px 0' }}>
            Something went wrong in DevCaddy. The error has been logged to the
            console.
          </p>
          {this.state.error && (
            <details
              style={{
                marginBottom: '12px',
                padding: '8px',
                background: '#fff',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace',
              }}
            >
              <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                Error Details
              </summary>
              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {this.state.error.toString()}
                {this.state.errorInfo && (
                  <div style={{ marginTop: '8px', color: '#666' }}>
                    {this.state.errorInfo.componentStack}
                  </div>
                )}
              </div>
            </details>
          )}
          <button
            onClick={this.handleReset}
            data-testid="error-boundary-reset"
            style={{
              padding: '8px 16px',
              background: '#721c24',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Reset DevCaddy
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
