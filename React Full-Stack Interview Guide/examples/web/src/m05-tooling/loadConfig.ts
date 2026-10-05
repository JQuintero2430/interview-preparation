import { z } from 'zod';

// Runtime config: values that differ per deployment but must NOT require a rebuild.
// The same built bundle runs in staging and production; the host injects the values.
export const AppConfigSchema = z.object({
  apiBaseUrl: z.url(),
  environment: z.enum(['development', 'staging', 'production']),
  featureFlags: z.record(z.string(), z.boolean()).default({}),
  sentryDsn: z.string().optional(),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

declare global {
  interface Window {
    // Injected by index.html (a <script> written by the server or the container entrypoint).
    __APP_CONFIG__?: unknown;
  }
}

export class ConfigError extends Error {
  readonly issues: readonly string[];

  constructor(message: string, issues: readonly string[] = []) {
    super(issues.length > 0 ? `${message}: ${issues.join('; ')}` : message);
    this.name = 'ConfigError';
    this.issues = issues;
  }
}

export function parseConfig(raw: unknown): AppConfig {
  const result = AppConfigSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map(
      (issue) => `${issue.path.map(String).join('.') || '(root)'}: ${issue.message}`,
    );
    throw new ConfigError('Invalid app config', issues);
  }
  return result.data;
}

type FetchLike = (url: string) => Promise<Pick<Response, 'ok' | 'status' | 'json'>>;

export type LoadConfigOptions = {
  /** Where the injected global lives. Defaults to `window`. */
  source?: { __APP_CONFIG__?: unknown };
  /** Used only when nothing was injected. Defaults to global `fetch`. */
  fetchImpl?: FetchLike;
  url?: string;
};

/**
 * 1. An injected `__APP_CONFIG__` wins (no network round trip, available before the first render).
 * 2. Otherwise fetch `/config.json` (works with a plain static host: just replace the file).
 * Either way the result is validated, so a typo in a deployment fails loudly at startup.
 */
export async function loadConfig(options: LoadConfigOptions = {}): Promise<AppConfig> {
  const source = options.source ?? window;
  if (source.__APP_CONFIG__ !== undefined) {
    return parseConfig(source.__APP_CONFIG__);
  }
  const fetchImpl = options.fetchImpl ?? ((url: string) => fetch(url));
  const url = options.url ?? '/config.json';
  const res = await fetchImpl(url);
  if (!res.ok) {
    throw new ConfigError(`Could not load ${url} (HTTP ${res.status})`);
  }
  return parseConfig(await res.json());
}
