import {
  ApplicationRef,
  Component,
  EnvironmentInjector,
  NgZone,
  inject,
  mergeApplicationConfig,
  provideAppInitializer,
  type ApplicationConfig,
} from '@angular/core';
import { bootstrapApplication, createApplication } from '@angular/platform-browser';

const HOST_TAG = 'lab-boot';

let events: string[] = [];
let appRef: ApplicationRef | undefined;
// A rejected bootstrap returns no ApplicationRef, so the initializer keeps its injector for teardown.
let bootEnv: EnvironmentInjector | undefined;

@Component({ selector: HOST_TAG, template: '<p>booted</p>' })
class Boot {
  constructor() {
    events.push('root component constructed');
  }
}

function addHost(): HTMLElement {
  const host = document.createElement(HOST_TAG);
  document.body.appendChild(host);
  return host;
}

function delayedInitializer(outcome: 'resolve' | 'reject'): ApplicationConfig {
  return {
    providers: [
      provideAppInitializer(() => {
        events.push('initializer start');
        bootEnv = inject(EnvironmentInjector);
        return new Promise<void>((resolve, reject) =>
          setTimeout(() => {
            events.push(`initializer ${outcome}d`);
            if (outcome === 'resolve') {
              resolve();
            } else {
              reject(new Error('config unavailable'));
            }
          }, 10),
        );
      }),
    ],
  };
}

describe('Section 6: bootstrapping', () => {
  beforeEach(() => {
    events = [];
    appRef = undefined;
    bootEnv = undefined;
  });

  afterEach(() => {
    appRef?.destroy();
    if (bootEnv && !bootEnv.destroyed) {
      bootEnv.destroy();
    }
    document.querySelectorAll(HOST_TAG).forEach((host) => host.remove());
  });

  it('Section 6: bootstrapApplication waits for an app initializer before creating the root component', async () => {
    const host = addHost();
    events.push('before bootstrap');
    const started = bootstrapApplication(Boot, delayedInitializer('resolve'));
    events.push('bootstrap returned (promise)');
    appRef = await started;
    events.push(`bootstrap promise resolved; components=${appRef.components.length}`);

    // bootstrapApplication is an async function that first awaits JIT resource resolution unless
    // `ngJitMode` is false. The unit-test build loads @angular/* unbundled (`externalPackages: true`), so
    // the build's `ngJitMode: false` never reaches them: the initializer starts after the call returns.
    expect(events).toEqual([
      'before bootstrap',
      'bootstrap returned (promise)',
      'initializer start',
      'initializer resolved',
      'root component constructed',
      'bootstrap promise resolved; components=1',
    ]);
    expect(host.innerHTML).toBe('<p>booted</p>');
  });

  it('Section 6: a rejected initializer rejects the bootstrap promise and creates no component', async () => {
    const host = addHost();
    await expect(bootstrapApplication(Boot, delayedInitializer('reject'))).rejects.toThrow(
      'config unavailable',
    );
    expect(events).not.toContain('root component constructed');
    expect(host.innerHTML).toBe('');
  });

  it('Section 6: createApplication creates the injector but no component', async () => {
    appRef = await createApplication({ providers: [] });
    expect(appRef.components.length).toBe(0);
    expect(appRef.injector.get(ApplicationRef)).toBe(appRef);
  });

  it('Section 6: mergeApplicationConfig concatenates providers', () => {
    const first: ApplicationConfig = { providers: [{ provide: 'a', useValue: 1 }] };
    const second: ApplicationConfig = { providers: [{ provide: 'b', useValue: 2 }] };
    expect(mergeApplicationConfig(first, second).providers).toEqual([
      ...first.providers,
      ...second.providers,
    ]);
  });

  it('Section 6: no zone is installed by default', async () => {
    appRef = await createApplication({ providers: [] });
    const zone = appRef.injector.get(NgZone);
    expect(typeof (globalThis as { Zone?: unknown }).Zone).toBe('undefined');
    // The NgZone token is still provided (code that injects it keeps working), but by a no-op stand-in,
    // not by the zone-backed NgZone class: bootstrap adds the zoneless providers first.
    expect(zone).not.toBeInstanceOf(NgZone);
    expect(zone.constructor.name).toBe('NoopNgZone');
  });
});
