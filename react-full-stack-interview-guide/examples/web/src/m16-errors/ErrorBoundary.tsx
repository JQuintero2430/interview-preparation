import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  fallback: ReactNode;
  onError?: (error: unknown, info: ErrorInfo) => void;
  children: ReactNode;
};

type State = { hasError: boolean };

/** The smallest useful error boundary: react.dev's example, typed. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  // Render phase: must be pure. Return the state that makes render() show the fallback.
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  // Commit phase: side effects such as logging belong here.
  componentDidCatch(error: unknown, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
