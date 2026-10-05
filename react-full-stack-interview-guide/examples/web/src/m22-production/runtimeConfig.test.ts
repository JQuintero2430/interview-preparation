import { ConfigError, configFromViteEnv, loadConfig, parseConfig } from './runtimeConfig';

const good = { apiBaseUrl: '/api', environment: 'staging', release: 'abc123' };

test('a valid config is returned typed', () => {
  expect(parseConfig(good)).toEqual(good);
  expect(parseConfig({ ...good, apiBaseUrl: 'https://api.example.com' }).apiBaseUrl).toBe('https://api.example.com');
});

test('every problem is reported at once', () => {
  try {
    parseConfig({ apiBaseUrl: 'api', environment: 'prod' });
    expect.unreachable();
  } catch (error) {
    expect(error).toBeInstanceOf(ConfigError);
    expect((error as ConfigError).problems).toHaveLength(3);
  }
});

test('non-objects are rejected', () => {
  expect(() => parseConfig(null)).toThrow(ConfigError);
  expect(() => parseConfig('x')).toThrow(/object/);
});

describe('loadConfig', () => {
  test('fetches uncached and validates', async () => {
    const calls: Array<[string, RequestInit | undefined]> = [];
    const config = await loadConfig(async (url, init) => {
      calls.push([url, init]);
      return { ok: true, status: 200, json: async () => good } as unknown as Response;
    });
    expect(config).toEqual(good);
    expect(calls).toEqual([['/config.json', { cache: 'no-store' }]]);
  });

  test('an HTTP failure becomes a ConfigError', async () => {
    const failing = async () => ({ ok: false, status: 404 }) as unknown as Response;
    await expect(loadConfig(failing)).rejects.toThrow(/404/);
  });
});

test('Vite env values go through the same validation, release defaults to dev', () => {
  const config = configFromViteEnv({ VITE_API_BASE_URL: '/api', VITE_APP_ENV: 'production' });
  expect(config).toEqual({ apiBaseUrl: '/api', environment: 'production', release: 'dev' });
  expect(() => configFromViteEnv({})).toThrow(ConfigError);
});
