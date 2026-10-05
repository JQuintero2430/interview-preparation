export type AppConfig = {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
  release: string;
};

const ENVIRONMENTS = ['development', 'staging', 'production'] as const;

export class ConfigError extends Error {
  problems: string[];
  constructor(problems: string[]) {
    super(`Invalid configuration: ${problems.join('; ')}`);
    this.name = 'ConfigError';
    this.problems = problems;
  }
}

/** Validates an untrusted object (a `config.json`, or values from `import.meta.env`). Fails loudly, once, at startup. */
export function parseConfig(raw: unknown): AppConfig {
  if (typeof raw !== 'object' || raw === null) throw new ConfigError(['config must be an object']);
  const input = raw as Record<string, unknown>;
  const problems: string[] = [];

  const apiBaseUrl = input['apiBaseUrl'];
  const validUrl = typeof apiBaseUrl === 'string' && (apiBaseUrl.startsWith('/') || /^https?:\/\//.test(apiBaseUrl));
  if (!validUrl) problems.push('apiBaseUrl must be a path ("/api") or an http(s) URL');

  const environment = ENVIRONMENTS.find((e) => e === input['environment']);
  if (!environment) problems.push(`environment must be one of ${ENVIRONMENTS.join(', ')}`);

  const release = input['release'];
  if (typeof release !== 'string' || release === '') problems.push('release must be a non-empty string');

  if (problems.length > 0 || typeof apiBaseUrl !== 'string' || !environment || typeof release !== 'string') {
    throw new ConfigError(problems);
  }
  return { apiBaseUrl, environment, release };
}

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

/** Build once, run anywhere: the container serves `/config.json`, the app reads it before rendering. */
export async function loadConfig(fetchFn: FetchLike = (url, init) => fetch(url, init), url = '/config.json'): Promise<AppConfig> {
  const response = await fetchFn(url, { cache: 'no-store' });
  if (!response.ok) throw new ConfigError([`GET ${url} returned ${response.status}`]);
  return parseConfig(await response.json());
}

/** Build-time alternative: values baked into the bundle. `env` is `import.meta.env` in a Vite app. */
export function configFromViteEnv(env: Readonly<Record<string, string | undefined>>): AppConfig {
  return parseConfig({
    apiBaseUrl: env['VITE_API_BASE_URL'],
    environment: env['VITE_APP_ENV'],
    release: env['VITE_RELEASE'] ?? 'dev',
  });
}
