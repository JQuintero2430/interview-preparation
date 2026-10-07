/** What a flag can say about itself. */
export interface FlagConfig {
  enabled: boolean;
  description: string;
  /** Percentage of user buckets (0–99) that get the feature while it is enabled. */
  rollout?: number;
}

/** Every feature flag. Adding an entry adds its name to `FlagName`. */
export const FEATURE_FLAGS = {
  newCheckout: { enabled: true, description: 'One-page checkout', rollout: 25 },
  darkMode: { enabled: true, description: 'Dark theme toggle' },
  betaSearch: { enabled: false, description: 'Search backed by the new index' },
} as const satisfies Record<string, FlagConfig>;

/** The name of a flag that exists. */
export type FlagName = keyof typeof FEATURE_FLAGS;

/**
 * Tells whether a flag is on for a user.
 * @param name A flag that exists; a misspelled name does not compile.
 * @param bucket The user's stable bucket, 0–99; flags without `rollout` ignore it.
 * @returns `true` when the flag is enabled and the bucket falls inside its rollout.
 */
export function isEnabled(name: FlagName, bucket = 0): boolean {
  // Widened on purpose: only some flags declare `rollout`, and FlagConfig says it is optional.
  const flag: FlagConfig = FEATURE_FLAGS[name];
  return flag.enabled && bucket < (flag.rollout ?? 100);
}
