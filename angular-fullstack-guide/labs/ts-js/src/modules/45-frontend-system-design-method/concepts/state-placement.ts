// Section 5 model: where a piece of state lives, asked in a fixed order. Our model, after module 28 section 1 (owner:
// 28 §1's kinds of state and their homes), not a library's code. The first true answer decides, so a shareable item
// never lands in a store. Storage lifetimes follow 09 section 7 (sessionStorage: one tab; localStorage: until cleared).

export type Survives = 'never' | 'reload' | 'restart';

export interface StateItem {
  readonly name: string;
  /** Must a shared link or the back button restore it? */
  readonly shareable: boolean;
  /** Does the server own the truth? */
  readonly serverOwned: boolean;
  /** 'reload': survives a reload in this tab; 'restart': survives closing the browser. */
  readonly survives: Survives;
  readonly sharedAcrossFeatures: boolean;
}

export type Home = 'url' | 'server-cache' | 'storage' | 'store' | 'component';
export type Lifetime = 'tab' | 'until cleared';

export interface Placement {
  readonly home: Home;
  /** Set only when the home is storage. */
  readonly lifetime?: Lifetime;
}

export function placeState(item: StateItem): Placement {
  if (item.shareable) return { home: 'url' };
  if (item.serverOwned) return { home: 'server-cache' };
  if (item.survives !== 'never') return { home: 'storage', lifetime: lifetimeOf(item.survives) };
  if (item.sharedAcrossFeatures) return { home: 'store' };
  return { home: 'component' };
}

function lifetimeOf(survives: 'reload' | 'restart'): Lifetime {
  return survives === 'reload' ? 'tab' : 'until cleared';
}
