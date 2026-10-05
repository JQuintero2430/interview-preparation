import { Component } from 'react';
import { fetchUser, type User } from './userApi';

type Props = { userId: string };
type State = { result: { forId: string; user: User } | { forId: string; error: string } | null };

/** The legacy version: loading logic split across three lifecycle methods. */
export class UserCardClass extends Component<Props, State> {
  state: State = { result: null };
  private controller: AbortController | null = null;

  componentDidMount() {
    this.load(this.props.userId);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevProps.userId !== this.props.userId) this.load(this.props.userId);
    if (prevState.result !== this.state.result) this.syncTitle();
  }

  componentWillUnmount() {
    this.controller?.abort();
  }

  load(userId: string) {
    this.controller?.abort(); // forget to do this and a slow, stale response can win
    const controller = new AbortController();
    this.controller = controller;
    fetchUser(userId, controller.signal)
      .then((user) => this.setState({ result: { forId: userId, user } }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        this.setState({ result: { forId: userId, error: String(error) } });
      });
  }

  syncTitle() {
    const { result } = this.state;
    if (result && 'user' in result) document.title = result.user.name;
  }

  render() {
    const { result } = this.state;
    if (result?.forId !== this.props.userId) return <p>Loading…</p>;
    if ('error' in result) return <p role="alert">{result.error}</p>;
    return <h2>{result.user.name}</h2>;
  }
}
