import { PureComponent } from 'react';

export const renders: string[] = [];

/** PureComponent: re-renders only when a prop or state value changes by shallow (Object.is) comparison. */
export class PureList extends PureComponent<{ items: string[] }> {
  render() {
    renders.push(this.props.items.join(','));
    return (
      <ul>
        {this.props.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
}
