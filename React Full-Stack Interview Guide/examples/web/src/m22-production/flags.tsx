import { createContext, useContext, useMemo, type ReactNode } from 'react';

/** The single source of truth for flag names and types. Adding a flag means adding it here. */
export type Flags = {
  newCheckout: boolean;
  searchV2: boolean;
  maxItems: number;
  bannerText: string;
};

/** Defaults are what users get when the flag service is down: always the safe, old behaviour. */
export const flagDefaults: Flags = {
  newCheckout: false,
  searchV2: false,
  maxItems: 10,
  bannerText: '',
};

const FlagsContext = createContext<Flags>(flagDefaults);

function assign<K extends keyof Flags>(target: Partial<Flags>, key: K, value: Flags[K] | undefined) {
  if (value !== undefined) target[key] = value;
}

/** defaults < remote < overrides; `undefined` never wins. */
export function mergeFlags(...layers: Array<Partial<Flags> | undefined>): Flags {
  const merged: Flags = { ...flagDefaults };
  for (const layer of layers) {
    if (!layer) continue;
    for (const key of Object.keys(layer) as Array<keyof Flags>) assign(merged, key, layer[key]);
  }
  return merged;
}

/** Validates an untrusted payload (a flag service response): unknown names and wrong types are dropped. */
export function parseFlags(raw: unknown): Partial<Flags> {
  if (typeof raw !== 'object' || raw === null) return {};
  const input = raw as Record<string, unknown>;
  const out: Partial<Flags> = {};
  for (const key of Object.keys(flagDefaults) as Array<keyof Flags>) {
    const value = input[key];
    if (typeof value === typeof flagDefaults[key]) assign(out, key, value as Flags[keyof Flags]);
  }
  return out;
}

type FlagsProviderProps = {
  /** Values from the flag service, already fetched (by TanStack Query, a loader, `use`...). */
  flags?: Partial<Flags>;
  /** Local overrides: tests, Storybook, a QA query string. They beat everything else. */
  overrides?: Partial<Flags>;
  children: ReactNode;
};

export function FlagsProvider({ flags, overrides, children }: FlagsProviderProps) {
  const value = useMemo(() => mergeFlags(flags, overrides), [flags, overrides]);
  return <FlagsContext value={value}>{children}</FlagsContext>;
}

export function useFlag<K extends keyof Flags>(name: K): Flags[K] {
  return useContext(FlagsContext)[name];
}
