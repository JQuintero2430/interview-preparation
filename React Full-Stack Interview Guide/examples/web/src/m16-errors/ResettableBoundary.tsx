import { Component, type ErrorInfo, type ReactNode } from 'react';

export type FallbackArgs = { error: unknown; reset: () => void };

type Props = {
  children: ReactNode;
  /** Renders the fallback; call `reset` to retry rendering the children. */
  fallbackRender: (args: FallbackArgs) => ReactNode;
  /** When any key changes (Object.is) while the fallback is showing, the boundary resets itself. */
  resetKeys?: readonly unknown[];
  onError?: (error: unknown, info: ErrorInfo) => void;
  onReset?: () => void;
};

type State = { failed: false; error: null } | { failed: true; error: unknown };

const initialState: State = { failed: false, error: null };

function keysChanged(prev: readonly unknown[] = [], next: readonly unknown[] = []): boolean {
  return prev.length !== next.length || prev.some((key, i) => !Object.is(key, next[i]));
}

/** A reusable error boundary with a retry function and reset keys (Exercise 1). */
export class ResettableBoundary extends Component<Props, State> {
  state: State = initialState;

  static getDerivedStateFromError(error: unknown): State {
    return { failed: true, error };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    // Reset only if the fallback was ALREADY showing before this update. Otherwise an update
    // that changes a key and also throws would reset straight away and hide its own error.
    if (this.state.failed && prevState.failed && keysChanged(prevProps.resetKeys, this.props.resetKeys)) {
      this.reset();
    }
  }

  reset = () => {
    this.props.onReset?.();
    this.setState(initialState);
  };

  render() {
    if (this.state.failed) {
      return this.props.fallbackRender({ error: this.state.error, reset: this.reset });
    }
    return this.props.children;
  }
}
