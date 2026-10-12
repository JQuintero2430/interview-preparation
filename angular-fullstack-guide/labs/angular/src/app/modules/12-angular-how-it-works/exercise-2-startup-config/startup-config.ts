import {
  InjectionToken,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
  type EnvironmentProviders,
} from '@angular/core';

export interface AppConfig {
  readonly apiUrl: string;
  readonly features: readonly string[];
}

export interface StartupConfigOptions {
  /** Used when the source rejects; never used for a payload that fails validation. */
  readonly fallback?: AppConfig;
}

interface ConfigSlot {
  config: AppConfig | undefined;
}

/** The loaded configuration; readable once the startup initializer has finished. */
export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

const CONFIG_SLOT = new InjectionToken<ConfigSlot>('CONFIG_SLOT');

// One check per field, so a new field adds an entry, not a branch.
const FIELD_CHECKS: Record<keyof AppConfig, (value: unknown) => boolean> = {
  apiUrl: (value) => typeof value === 'string' && value.length > 0,
  features: (value) => Array.isArray(value) && value.every((item) => typeof item === 'string'),
};

/**
 * Loads the configuration once per application, before the root component is created, and
 * exposes it as APP_CONFIG.
 */
export function provideStartupConfig(
  source: () => Promise<unknown>,
  options: StartupConfigOptions = {},
): EnvironmentProviders {
  return makeEnvironmentProviders([
    // A factory, not useValue, so two applications bootstrapped from one config get two slots.
    { provide: CONFIG_SLOT, useFactory: (): ConfigSlot => ({ config: undefined }) },
    { provide: APP_CONFIG, useFactory: readLoadedConfig },
    provideAppInitializer(() => {
      const slot = inject(CONFIG_SLOT);
      return loadConfig(source, options.fallback).then((config) => {
        slot.config = config;
      });
    }),
  ]);
}

/** Checks an untrusted payload and returns a typed copy, or throws naming the first bad field. */
export function parseAppConfig(payload: unknown): AppConfig {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Invalid startup config: expected an object');
  }
  const record = payload as Record<string, unknown>;
  const badField = Object.entries(FIELD_CHECKS).find(([field, isValid]) => !isValid(record[field]));
  if (badField !== undefined) {
    throw new Error(`Invalid startup config: "${badField[0]}" is missing or has the wrong type`);
  }
  return { apiUrl: record['apiUrl'] as string, features: [...(record['features'] as string[])] };
}

function loadConfig(source: () => Promise<unknown>, fallback?: AppConfig): Promise<AppConfig> {
  return source().then(parseAppConfig, (error: unknown) => {
    if (fallback === undefined) {
      throw error;
    }
    return fallback;
  });
}

function readLoadedConfig(): AppConfig {
  const { config } = inject(CONFIG_SLOT);
  if (config === undefined) {
    throw new Error('APP_CONFIG was read before the startup config finished loading');
  }
  return config;
}
