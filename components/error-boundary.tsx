'use client';

import * as React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** Page-level label shown in the error UI */
  pageName?: string;
}

// ─────────────────────────────────────────────────────────────────
// Class-based Error Boundary (required by React)
// ─────────────────────────────────────────────────────────────────
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[OracleQuest ErrorBoundary]', error, info);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <PageErrorFallback
          error={this.state.error}
          reset={this.reset}
          pageName={this.props.pageName}
        />
      );
    }
    return this.props.children;
  }
}

// ─────────────────────────────────────────────────────────────────
// Default full-page error fallback
// ─────────────────────────────────────────────────────────────────
function PageErrorFallback({
  error,
  reset,
  pageName,
}: {
  error: Error | null;
  reset: () => void;
  pageName?: string;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 space-y-6">
      {/* Glow blob */}
      <div className="absolute w-[400px] h-[400px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative p-5 rounded-2xl bg-rose-950/30 border border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
        <AlertTriangle className="h-10 w-10 text-rose-400 mx-auto" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-black text-white tracking-tight">
          {pageName ? `${pageName} failed to load` : 'Something went wrong'}
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          An unexpected error occurred. This usually resolves itself — try refreshing or returning home.
        </p>
        {process.env.NODE_ENV === 'development' && error?.message && (
          <pre className="mt-3 text-[10px] font-mono text-rose-300/80 bg-rose-950/40 border border-rose-500/20 rounded-lg p-3 max-w-md text-left overflow-auto whitespace-pre-wrap">
            {error.message}
          </pre>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 h-9 px-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold hover:bg-rose-900/50 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try Again
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 h-9 px-4 rounded-xl bg-purple-950/60 border border-purple-500/40 text-cyan-300 text-xs font-mono font-bold hover:bg-purple-900/40 transition-all"
        >
          <Home className="h-3.5 w-3.5" />
          Go Home
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Compact inline error (for sections, not full pages)
// ─────────────────────────────────────────────────────────────────
export function InlineError({
  message = 'Failed to load data.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs font-mono text-rose-300">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 text-rose-300 hover:text-white transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Empty State (for empty lists, no data)
// ─────────────────────────────────────────────────────────────────
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 space-y-4">
      {Icon && (
        <div className="h-14 w-14 rounded-2xl bg-purple-950/60 border border-purple-900/60 flex items-center justify-center">
          <Icon className="h-7 w-7 text-muted-foreground opacity-50" />
        </div>
      )}
      <div className="space-y-1.5">
        <p className="text-base font-bold text-white">{title}</p>
        {description && <p className="text-sm text-muted-foreground max-w-xs">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1.5 mt-2 h-9 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-black text-xs font-bold font-mono shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:from-cyan-400 transition-all"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
