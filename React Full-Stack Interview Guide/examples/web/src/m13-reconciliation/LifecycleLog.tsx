import { Component } from 'react';

// Every lifecycle call appends to this log, so a test can assert the exact order.
export const log: string[] = [];

type Props = { value: number };
type ParentState = { ticks: number };
type ChildState = { lastValue: number };

/** Logs every non-deprecated class lifecycle method. Its button re-renders it without changing `value`. */
export class Parent extends Component<Props, ParentState> {
  constructor(props: Props) {
    super(props);
    this.state = { ticks: 0 };
    log.push('Parent constructor');
  }

  static getDerivedStateFromProps(): null {
    log.push('Parent getDerivedStateFromProps');
    return null; // nothing to derive; returning null means "no state change"
  }

  componentDidMount() {
    log.push('Parent componentDidMount');
  }

  shouldComponentUpdate() {
    log.push('Parent shouldComponentUpdate true');
    return true;
  }

  getSnapshotBeforeUpdate() {
    log.push('Parent getSnapshotBeforeUpdate');
    return null;
  }

  componentDidUpdate() {
    log.push('Parent componentDidUpdate');
  }

  componentWillUnmount() {
    log.push('Parent componentWillUnmount');
  }

  tick = () => this.setState((s) => ({ ticks: s.ticks + 1 }));

  render() {
    log.push('Parent render');
    return (
      <div>
        <button onClick={this.tick}>Tick {this.state.ticks}</button>
        <Child value={this.props.value} />
      </div>
    );
  }
}

/** Skips re-rendering when `value` is unchanged, like a hand-written PureComponent. */
export class Child extends Component<Props, ChildState> {
  constructor(props: Props) {
    super(props);
    this.state = { lastValue: props.value };
    log.push('Child constructor');
  }

  static getDerivedStateFromProps(props: Props): ChildState {
    log.push('Child getDerivedStateFromProps');
    return { lastValue: props.value };
  }

  componentDidMount() {
    log.push('Child componentDidMount');
  }

  shouldComponentUpdate(nextProps: Props) {
    const changed = nextProps.value !== this.props.value;
    log.push(`Child shouldComponentUpdate ${changed}`);
    return changed;
  }

  getSnapshotBeforeUpdate() {
    log.push('Child getSnapshotBeforeUpdate');
    return null;
  }

  componentDidUpdate() {
    log.push('Child componentDidUpdate');
  }

  componentWillUnmount() {
    log.push('Child componentWillUnmount');
  }

  render() {
    log.push('Child render');
    return <p>Value: {this.state.lastValue}</p>;
  }
}
