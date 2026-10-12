import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef, Component, resource, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormField, debounce, form, minLength, validateAsync, validateHttp } from '@angular/forms/signals';

interface LabM26Signup {
  user: string;
}

function labM26UsernameForm(log: string[], user: string, wait = 100, debounceMs?: number) {
  const model = signal<LabM26Signup>({ user });
  const f = form(model, (p) => {
    minLength(p.user, 3);
    validateAsync(p.user, {
      params: ({ value }) => value(),
      debounce: debounceMs,
      factory: (params) =>
        resource({
          params,
          loader: async ({ params: name }) => {
            log.push(name);
            await new Promise<void>((done) => setTimeout(done, wait));
            return name === 'ann';
          },
        }),
      onSuccess: (taken) => (taken ? { kind: 'taken' } : undefined),
      onError: () => ({ kind: 'err' }),
    });
  });
  return { model, f };
}

async function withFakeTimers(run: () => Promise<void>): Promise<void> {
  vi.useFakeTimers();
  try {
    await run();
  } finally {
    vi.useRealTimers();
  }
}

async function settle(ms: number): Promise<void> {
  await vi.advanceTimersByTimeAsync(ms);
  TestBed.tick();
}

@Component({
  selector: 'lab-m26-debounce-host',
  imports: [FormField],
  template: `
    <input id="n" [formField]="f.name" />
    <p id="out">{{ f.name().value() }}</p>
  `,
})
class LabM26DebounceHost {
  readonly model = signal({ name: '' });
  protected readonly f = form(this.model, (p) => {
    debounce(p.name, 50);
  });
}

async function mount(): Promise<ComponentFixture<LabM26DebounceHost>> {
  const fixture = TestBed.createComponent(LabM26DebounceHost);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  return fixture;
}

function type(fixture: ComponentFixture<LabM26DebounceHost>, value: string): HTMLInputElement {
  const input = fixture.nativeElement.querySelector('#n') as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input'));
  return input;
}

describe('Section 6: async validation and debounce()', () => {
  it('Section 6: an async rule is pending while its resource loads', async () => {
    await withFakeTimers(async () => {
      await TestBed.runInInjectionContext(async () => {
        const log: string[] = [];
        const { f } = labM26UsernameForm(log, 'ann');
        TestBed.tick();
        expect(f.user().pending()).toBe(true);
        await settle(150);
        expect(f.user().pending()).toBe(false);
      });
    });
  });

  it('Section 6: a pending field is neither valid nor invalid', async () => {
    await withFakeTimers(async () => {
      await TestBed.runInInjectionContext(async () => {
        const { f } = labM26UsernameForm([], 'ann');
        TestBed.tick();
        expect(f.user().valid()).toBe(false);
        expect(f.user().invalid()).toBe(false);
        expect(f.user().errors()).toEqual([]);
      });
    });
  });

  it('Section 6: an async rule does not run while a sync rule fails', async () => {
    await withFakeTimers(async () => {
      await TestBed.runInInjectionContext(async () => {
        const log: string[] = [];
        const { model, f } = labM26UsernameForm(log, 'an');
        await settle(150);
        expect(log).toEqual([]);
        expect(f.user().pending()).toBe(false);
        expect(f.user().errors().map((e) => e.kind)).toEqual(['minLength']);
        model.set({ user: 'bob' });
        await settle(150);
        expect(log).toEqual(['bob']);
      });
    });
  });

  it('Section 6: the resolved value maps to a field error', async () => {
    await withFakeTimers(async () => {
      await TestBed.runInInjectionContext(async () => {
        const log: string[] = [];
        const { f } = labM26UsernameForm(log, 'ann');
        TestBed.tick();
        await settle(150);
        expect(log).toEqual(['ann']);
        expect(f.user().errors().map((e) => e.kind)).toEqual(['taken']);
        expect(f.user().valid()).toBe(false);
      });
    });
  });

  it('Section 6: a value change while loading discards the stale result', async () => {
    await withFakeTimers(async () => {
      await TestBed.runInInjectionContext(async () => {
        const log: string[] = [];
        const { model, f } = labM26UsernameForm(log, 'ann');
        TestBed.tick();
        await settle(50);
        model.set({ user: 'bob' });
        TestBed.tick();
        await settle(40);
        expect(f.user().errors()).toEqual([]);
        expect(f.user().pending()).toBe(true);
        await settle(150);
        expect(log).toEqual(['ann', 'bob']);
        expect(f.user().pending()).toBe(false);
        expect(f.user().errors()).toEqual([]);
        expect(f.user().valid()).toBe(true);
      });
    });
  });

  it('Section 6: reloadValidation runs the async rule again', async () => {
    await withFakeTimers(async () => {
      await TestBed.runInInjectionContext(async () => {
        const log: string[] = [];
        const { f } = labM26UsernameForm(log, 'ann');
        TestBed.tick();
        await settle(150);
        expect(log).toEqual(['ann']);
        f.user().reloadValidation();
        TestBed.tick();
        expect(f.user().pending()).toBe(true);
        await settle(150);
        expect(log).toEqual(['ann', 'ann']);
        expect(f.user().pending()).toBe(false);
      });
    });
  });

  it('Section 6: the debounce option of validateAsync delays the loader', async () => {
    await withFakeTimers(async () => {
      await TestBed.runInInjectionContext(async () => {
        const log: string[] = [];
        const { model } = labM26UsernameForm(log, 'bob', 100, 50);
        await settle(200);
        expect(log).toEqual(['bob']);
        model.set({ user: 'cat' });
        TestBed.tick();
        await settle(30);
        expect(log).toEqual(['bob']);
        expect(model().user).toBe('cat');
        await settle(40);
        expect(log).toEqual(['bob', 'cat']);
      });
    });
  });

  it('Section 6: validateHttp maps the response to an error', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    await TestBed.runInInjectionContext(async () => {
      const f = form(signal<LabM26Signup>({ user: 'ann' }), (p) => {
        validateHttp<LabM26Signup['user'], { taken: boolean }>(p.user, {
          request: ({ value }) => `/api/users/${value()}`,
          onSuccess: (res) => (res.taken ? { kind: 'taken' } : undefined),
          onError: () => ({ kind: 'err' }),
        });
      });
      TestBed.tick();
      expect(f.user().pending()).toBe(true);
      http.expectOne('/api/users/ann').flush({ taken: true });
      await TestBed.inject(ApplicationRef).whenStable();
      TestBed.tick();
      expect(f.user().pending()).toBe(false);
      expect(f.user().errors().map((e) => e.kind)).toEqual(['taken']);
      http.verify();
    });
  });

  it('Section 6: a debounced field writes the model after the delay', async () => {
    const fixture = await mount();
    type(fixture, 'Zed');
    expect(fixture.componentInstance.model().name).toBe('');
    await new Promise<void>((done) => setTimeout(done, 80));
    await fixture.whenStable();
    expect(fixture.componentInstance.model().name).toBe('Zed');
    expect((fixture.nativeElement.querySelector('#out') as HTMLElement).textContent).toBe('Zed');
  });

  it('Section 6: blur flushes a debounced value', async () => {
    const fixture = await mount();
    const input = type(fixture, 'Zo');
    expect(fixture.componentInstance.model().name).toBe('');
    input.dispatchEvent(new Event('blur'));
    expect(fixture.componentInstance.model().name).toBe('Zo');
  });
});
