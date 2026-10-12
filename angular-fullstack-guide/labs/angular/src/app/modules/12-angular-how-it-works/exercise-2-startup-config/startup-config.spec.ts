import {
  ApplicationRef,
  Component,
  EnvironmentInjector,
  inject,
  provideAppInitializer,
  type ApplicationConfig,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { APP_CONFIG, provideStartupConfig, type AppConfig } from './startup-config';

const HOST_TAG = 'lab-config-shell';
const LOADED: AppConfig = { apiUrl: 'https://api.example.test', features: ['search'] };
const FALLBACK: AppConfig = { apiUrl: '/api', features: [] };

let events: string[] = [];
let appRefs: ApplicationRef[] = [];
// A rejected bootstrap returns no ApplicationRef, so an initializer keeps the injector for teardown.
let bootEnvs: EnvironmentInjector[] = [];

@Component({
  selector: HOST_TAG,
  template: `<p>{{ config.apiUrl }} {{ config.features.join(',') }}</p>`,
})
class Shell {
  readonly config = inject(APP_CONFIG);

  constructor() {
    events.push('root component constructed');
  }
}

function addHost(): HTMLElement {
  const host = document.createElement(HOST_TAG);
  document.body.appendChild(host);
  return host;
}

function appConfig(...providers: ApplicationConfig['providers']): ApplicationConfig {
  const captureInjector = provideAppInitializer(() => {
    bootEnvs.push(inject(EnvironmentInjector));
  });
  return { providers: [captureInjector, ...providers] };
}

async function boot(config: ApplicationConfig): Promise<ApplicationRef> {
  const appRef = await bootstrapApplication(Shell, config);
  appRefs.push(appRef);
  return appRef;
}

describe('E12.2 provideStartupConfig', () => {
  beforeEach(() => {
    events = [];
    appRefs = [];
    bootEnvs = [];
  });

  afterEach(() => {
    appRefs.filter((appRef) => !appRef.destroyed).forEach((appRef) => appRef.destroy());
    bootEnvs.filter((env) => !env.destroyed).forEach((env) => env.destroy());
    document.querySelectorAll(HOST_TAG).forEach((host) => host.remove());
  });

  it('creates the root component only after the source resolves, and inject(APP_CONFIG) returns the loaded values', async () => {
    const host = addHost();
    let resolveSource: (payload: unknown) => void = () => undefined;
    const source = () =>
      new Promise<unknown>((resolve) => {
        events.push('source called');
        resolveSource = resolve;
      });

    const started = boot(appConfig(provideStartupConfig(source)));
    await new Promise((settle) => setTimeout(settle, 10));
    expect(events).toEqual(['source called']);
    expect(host.innerHTML).toBe('');

    resolveSource(LOADED);
    const appRef = await started;
    expect(events).toEqual(['source called', 'root component constructed']);
    expect(appRef.injector.get(APP_CONFIG)).toEqual(LOADED);
    expect(host.textContent).toBe('https://api.example.test search');
  });

  it('rejects bootstrap with an error naming the bad field for an invalid payload', async () => {
    addHost();
    const source = () =>
      Promise.resolve({ apiUrl: 'https://api.example.test', features: 'search' });
    // The fallback covers an unreachable source only: a bad payload must still fail the bootstrap.
    const config = appConfig(provideStartupConfig(source, { fallback: FALLBACK }));
    await expect(boot(config)).rejects.toThrow('"features"');
    expect(events).not.toContain('root component constructed');
  });

  it('bootstraps with the fallback when the source rejects and a fallback is given', async () => {
    const host = addHost();
    const source = () => Promise.reject(new Error('config.json: 404'));
    const appRef = await boot(appConfig(provideStartupConfig(source, { fallback: FALLBACK })));
    expect(appRef.injector.get(APP_CONFIG)).toEqual(FALLBACK);
    expect(host.textContent).toBe('/api ');
  });

  it('rejects the bootstrap promise when the source rejects and there is no fallback', async () => {
    const host = addHost();
    const source = () => Promise.reject(new Error('config.json: 404'));
    await expect(boot(appConfig(provideStartupConfig(source)))).rejects.toThrow('config.json: 404');
    expect(host.innerHTML).toBe('');
  });

  it('calls the source exactly once per application', async () => {
    let calls = 0;
    const source = () => {
      calls += 1;
      return Promise.resolve(LOADED);
    };
    const config = appConfig(provideStartupConfig(source));

    addHost();
    const first = await boot(config);
    const firstConfig = first.injector.get(APP_CONFIG);
    expect(first.injector.get(APP_CONFIG)).toBe(firstConfig);
    expect(calls).toBe(1);

    first.destroy();
    addHost();
    const second = await boot(config);
    expect(calls).toBe(2);
    expect(second.injector.get(APP_CONFIG)).not.toBe(firstConfig);
  });
});
