import { Component, useEffect, type ReactNode } from 'react';
import type { RootOptions } from 'react-dom/client';
import { messageOf } from './Bomb';

// Every render, boundary catch and root callback writes here, so a test can assert the order.
export const log: string[] = [];

type BoundaryProps = { name: string; throwInFallback?: boolean; children: ReactNode };
type BoundaryState = { message: string | null };

/** A boundary that logs what it catches. `throwInFallback` makes the boundary itself fail. */
export class NamedBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { message: null };

  static getDerivedStateFromError(error: unknown): BoundaryState {
    return { message: messageOf(error) };
  }

  componentDidCatch(error: unknown) {
    log.push(`${this.props.name} componentDidCatch: ${messageOf(error)}`);
  }

  render() {
    const { message } = this.state;
    if (message === null) return this.props.children;
    if (this.props.throwInFallback) throw new Error(`${this.props.name} fallback boom`);
    return (
      <p role="alert">
        {this.props.name} fallback: {message}
      </p>
    );
  }
}

export type Mode = 'render' | 'effect' | 'event' | 'timeout';

function useRenderLog(name: string) {
  log.push(`${name} render`);
}

/** Throws in a different place depending on `mode`. */
export function Widget({ mode }: { mode: Mode }) {
  useRenderLog('Widget');

  useEffect(() => {
    if (mode === 'effect') throw new Error('effect boom');
    if (mode !== 'timeout') return;
    const id = setTimeout(() => {
      throw new Error('timeout boom');
    }, 100);
    return () => clearTimeout(id);
  }, [mode]);

  if (mode === 'render') throw new Error('render boom');

  return (
    <button
      type="button"
      onClick={() => {
        throw new Error('click boom');
      }}
    >
      Widget ({mode})
    </button>
  );
}

/** Outer boundary > heading + Inner boundary > Widget. */
export function App({ mode, throwInInnerFallback = false }: { mode: Mode; throwInInnerFallback?: boolean }) {
  return (
    <NamedBoundary name="Outer">
      <h1>Dashboard</h1>
      <NamedBoundary name="Inner" throwInFallback={throwInInnerFallback}>
        <Widget mode={mode} />
      </NamedBoundary>
    </NamedBoundary>
  );
}

/** Root options that log which callback fired, and for caught errors, which boundary caught it. */
export const rootCallbacks = {
  onCaughtError(error, info) {
    const boundary = info.errorBoundary instanceof NamedBoundary ? info.errorBoundary.props.name : 'unknown';
    log.push(`onCaughtError: ${messageOf(error)} via ${boundary}`);
  },
  onUncaughtError(error) {
    log.push(`onUncaughtError: ${messageOf(error)}`);
  },
} satisfies RootOptions;
