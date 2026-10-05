// Patterns you will READ in older codebases. Each has a modern replacement in the module text.
import { Component, useState, type ComponentType, type ReactNode } from 'react';

// 1) Class component -------------------------------------------------------------------------
type CounterProps = { step?: number };
type CounterState = { count: number };

/** Class component: state lives on `this.state`, updates go through `this.setState`. */
export class ClassCounter extends Component<CounterProps, CounterState> {
  static defaultProps = { step: 1 }; // still supported on classes in React 19

  state: CounterState = { count: 0 };

  // Arrow-function class field: `this` is bound, so it can be passed as onClick directly.
  increment = () => {
    this.setState((prev, props) => ({ count: prev.count + (props.step ?? 1) }));
  };

  render() {
    return <button onClick={this.increment}>Count: {this.state.count}</button>;
  }
}

// 2) Higher-order component (HOC) ------------------------------------------------------------
type LoadingProps = { loading: boolean };

/** HOC: takes a component, returns a new one that renders a spinner while `loading` is true. */
export function withLoading<P extends object>(Wrapped: ComponentType<P>) {
  function WithLoading({ loading, ...props }: P & LoadingProps) {
    return loading ? <p role="status">Loading…</p> : <Wrapped {...(props as P)} />;
  }
  WithLoading.displayName = `withLoading(${Wrapped.displayName ?? Wrapped.name})`;
  return WithLoading;
}

// 3) Render prop ----------------------------------------------------------------------------
/** Render prop: the component owns the hover state and lets the caller decide what to render. */
export function Hoverable({ children }: { children: (hovered: boolean) => ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {children(hovered)}
    </div>
  );
}

// 4) defaultProps on a function component (removed in React 19) ------------------------------
/** Shows the React 19 removal: JSX ignores `defaultProps` on function components. */
export function LegacyGreeting({ name }: { name?: string }) {
  return <p>Hello, {name ?? 'stranger'}</p>;
}
LegacyGreeting.defaultProps = { name: 'world' };
