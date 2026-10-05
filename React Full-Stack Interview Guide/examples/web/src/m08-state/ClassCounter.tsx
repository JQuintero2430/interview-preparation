import { Component } from 'react';

type Props = { onLog: (message: string) => void };
type State = { count: number; label: string };

/** Legacy class component, for reading old code: setState MERGES, and takes an after-commit callback. */
export class ClassCounter extends Component<Props, State> {
  state: State = { count: 0, label: 'Clicks' };

  // Same snapshot problem as hooks: this.state is not updated until React re-renders.
  addThreeWithObjects = () => {
    this.setState({ count: this.state.count + 1 });
    this.setState({ count: this.state.count + 1 });
    this.setState({ count: this.state.count + 1 });
  };

  addThreeWithUpdaters = () => {
    this.setState((prev) => ({ count: prev.count + 1 }));
    this.setState((prev) => ({ count: prev.count + 1 }));
    this.setState((prev) => ({ count: prev.count + 1 }));
  };

  addOneAndLog = () => {
    this.setState({ count: this.state.count + 1 }, () => {
      this.props.onLog(`callback: ${this.state.count}`); // runs after the update is committed
    });
    this.props.onLog(`right after setState: ${this.state.count}`);
  };

  render() {
    // `label` is never passed to setState above, yet it survives every update: setState merges.
    return (
      <div>
        <p>
          {this.state.label}: {this.state.count}
        </p>
        <button onClick={this.addThreeWithObjects}>objects ×3</button>
        <button onClick={this.addThreeWithUpdaters}>updaters ×3</button>
        <button onClick={this.addOneAndLog}>add and log</button>
      </div>
    );
  }
}
