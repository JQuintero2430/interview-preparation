import { describe, expect, it, vi } from 'vitest';
import { ConfigError, loadConfig, parseConfig } from './loadConfig';

const valid = { apiBaseUrl: 'https://api.example.com', environment: 'staging' };

function jsonResponse(body: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) };
}

describe('parseConfig', () => {
  it('applies defaults and returns typed data', () => {
    const config = parseConfig(valid);
    expect(config.featureFlags).toEqual({});
    expect(config.environment).toBe('staging');
  });

  it('reports every problem with its path', () => {
    try {
      parseConfig({ apiBaseUrl: 'nope', environment: 'qa' });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigError);
      const { issues } = error as ConfigError;
      expect(issues.some((i) => i.startsWith('apiBaseUrl:'))).toBe(true);
      expect(issues.some((i) => i.startsWith('environment:'))).toBe(true);
    }
  });

  it('rejects non-objects', () => {
    expect(() => parseConfig(null)).toThrow(ConfigError);
  });
});

describe('loadConfig', () => {
  it('prefers the injected global and never fetches', async () => {
    const fetchImpl = vi.fn();
    const config = await loadConfig({ source: { __APP_CONFIG__: valid }, fetchImpl });
    expect(config.apiBaseUrl).toBe('https://api.example.com');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('falls back to /config.json', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve(jsonResponse({ ...valid, featureFlags: { beta: true } })));
    const config = await loadConfig({ source: {}, fetchImpl });
    expect(fetchImpl).toHaveBeenCalledWith('/config.json');
    expect(config.featureFlags).toEqual({ beta: true });
  });

  it('fails on a non-2xx response', async () => {
    const fetchImpl = () => Promise.resolve(jsonResponse({}, 404));
    await expect(loadConfig({ source: {}, fetchImpl })).rejects.toThrow(/HTTP 404/);
  });

  it('fails on an invalid injected value instead of trusting it', async () => {
    await expect(loadConfig({ source: { __APP_CONFIG__: { apiBaseUrl: 1 } } })).rejects.toBeInstanceOf(
      ConfigError,
    );
  });

  it('reads window.__APP_CONFIG__ by default', async () => {
    window.__APP_CONFIG__ = valid;
    try {
      await expect(loadConfig()).resolves.toMatchObject({ environment: 'staging' });
    } finally {
      delete window.__APP_CONFIG__;
    }
  });
});
