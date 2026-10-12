// labs/angular/src/app/modules/12-angular-how-it-works/outputs/q12-outputs.spec.ts
// Each test reproduces one "Output" question from Module 12 and asserts the exact lines the answer
// claims. If Angular changes behaviour, this file fails first.
import {
  type ApplicationRef,
  Component,
  EnvironmentInjector,
  inject,
  input,
  provideAppInitializer,
  provideEnvironmentInitializer,
  reflectComponentType,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

function recorder() {
  const lines: string[] = [];
  return { lines, log: (...parts: unknown[]) => lines.push(parts.map(String).join(' ')) };
}

// The fields of the private ɵcmp definition Q12.24 reads (shape from ɵɵdefineComponent in @angular/core 22.2.1).
interface ComponentDefinition {
  selectors: unknown[][];
  inputs: Record<string, unknown[]>;
  decls: number;
  vars: number;
  onPush: boolean;
}

describe('Module 12 output questions', () => {
  let appRef: ApplicationRef | undefined;
  // A rejected bootstrap returns no ApplicationRef, so Q12.18 keeps the injector for teardown.
  let bootEnv: EnvironmentInjector | undefined;

  afterEach(() => {
    appRef?.destroy();
    appRef = undefined;
    if (bootEnv && !bootEnv.destroyed) {
      bootEnv.destroy();
    }
    bootEnv = undefined;
    document.querySelectorAll('lab-q15, lab-q18').forEach((host) => host.remove());
  });

  it('Q12.15 the bootstrap call returns, the initializer settles, then the root component is created', async () => {
    const { lines, log } = recorder();
    document.body.appendChild(document.createElement('lab-q15'));

    @Component({ selector: 'lab-q15', template: '' })
    class Root {
      constructor() {
        log('root constructed');
      }
    }

    log('bootstrap called');
    const ready = bootstrapApplication(Root, {
      providers: [
        provideAppInitializer(async () => {
          log('initializer started');
          await Promise.resolve(); // settles in a microtask: no timer, no network
          log('initializer done');
        }),
      ],
    });
    log('bootstrap returned');
    appRef = await ready;
    log('bootstrap resolved');

    // Under `ng test` @angular/* load unbundled, so `ngJitMode` is not false inside them and
    // bootstrapApplication awaits resolveJitResources() before running initializers (section 6).
    expect(lines).toEqual([
      'bootstrap called',
      'bootstrap returned',
      'initializer started',
      'initializer done',
      'root constructed',
      'bootstrap resolved',
    ]);
  });

  it('Q12.18 a rejected initializer rejects the bootstrap promise and leaves the host empty', async () => {
    const { lines, log } = recorder();
    document.body.appendChild(document.createElement('lab-q18'));

    @Component({ selector: 'lab-q18', template: '<p>dashboard</p>' })
    class Shell {
      constructor() {
        log('root constructed');
      }
    }

    const fetchConfig = () => Promise.reject(new Error('503 from /config.json')); // the outage

    await bootstrapApplication(Shell, {
      providers: [
        // Test scaffolding only (not in the answer's snippet): keep the injector for afterEach.
        provideEnvironmentInitializer(() => (bootEnv = inject(EnvironmentInjector))),
        provideAppInitializer(async () => {
          log('loading config');
          await fetchConfig();
          log('config loaded');
        }),
      ],
    }).catch((err: Error) => log('bootstrap failed:', err.message));
    log('host is empty:', document.querySelector('lab-q18')!.innerHTML === '');

    expect(lines).toEqual([
      'loading config',
      'bootstrap failed: 503 from /config.json',
      'host is empty: true',
    ]);
  });

  it('Q12.24 the definition reports selectors, inputs, slots and onPush; reflectComponentType shows the public view', () => {
    const { lines, log } = recorder();

    @Component({
      selector: 'lab-q24, [labQ24]',
      template: `<h3 [title]="label()">{{ label() }}</h3><p>static text</p>`,
    })
    class Badge {
      readonly label = input.required<string>({ alias: 'heading' });
    }

    // Private API, read here only to show what the compiler produced.
    const def = (Badge as unknown as { ɵcmp: ComponentDefinition }).ɵcmp;
    log('selectors:', JSON.stringify(def.selectors));
    log('inputs:', JSON.stringify(def.inputs));
    log('decls:', def.decls, 'vars:', def.vars, 'onPush:', def.onPush);

    const mirror = reflectComponentType(Badge)!;
    log('selector:', mirror.selector);
    log('mirror inputs:', JSON.stringify(mirror.inputs));

    expect(lines).toEqual([
      'selectors: [["lab-q24"],["","labQ24",""]]',
      'inputs: {"heading":["label",1,null]}',
      'decls: 4 vars: 2 onPush: true',
      'selector: lab-q24,[labQ24]',
      'mirror inputs: [{"propName":"label","templateName":"heading","isSignal":true}]',
    ]);
  });
});
