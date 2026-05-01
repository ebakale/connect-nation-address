import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  /** Custom fallback node — overrides the default UI entirely. */
  fallback?: ReactNode;
  /** Short label shown in the compact fallback (e.g. "map", "chart"). */
  label?: string;
  /** Use a compact inline fallback instead of the full-page one. */
  inline?: boolean;
  /** Called after the boundary resets so parents can clear related state. */
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  key: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, key: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  private reset = () => {
    this.props.onReset?.();
    this.setState(prev => ({ hasError: false, error: undefined, key: prev.key + 1 }));
  };

  render() {
    if (!this.state.hasError) {
      // key change forces a full remount after reset
      return <React.Fragment key={this.state.key}>{this.props.children}</React.Fragment>;
    }

    if (this.props.fallback) return this.props.fallback;

    const label = this.props.label ?? 'component';

    if (this.props.inline) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <p className="font-medium text-destructive">Failed to load {label}</p>
          <p className="text-muted-foreground text-xs">{this.state.error?.message}</p>
          <Button variant="outline" size="sm" onClick={this.reset} className="mt-1 gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      );
    }

    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-8 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          The {label} encountered an error. You can retry or reload the page.
        </p>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" onClick={this.reset} className="gap-1.5">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
          <Button variant="ghost" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </div>
      </div>
    );
  }
}

/** Pre-configured boundary for map widgets. */
export const MapErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary inline label="map">
    {children}
  </ErrorBoundary>
);

/** Pre-configured boundary for PDF generators (shown inside a panel/dialog). */
export const PDFErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary inline label="PDF generator">
    {children}
  </ErrorBoundary>
);
