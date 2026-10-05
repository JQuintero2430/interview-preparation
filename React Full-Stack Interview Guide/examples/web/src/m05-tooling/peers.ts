import { satisfies } from './semver';

export type UnmetPeer = { name: string; required: string; installed: string | undefined };

/** What npm 7+ reports as ERESOLVE / what npm 6 only warned about. */
export function unmetPeers(installed: Record<string, string>, peers: Record<string, string>): UnmetPeer[] {
  return Object.entries(peers).flatMap(([name, required]) => {
    const version = installed[name];
    return version !== undefined && satisfies(version, required) ? [] : [{ name, required, installed: version }];
  });
}
