import { Component, resource, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormRoot, form, required, submit, validateAsync } from '@angular/forms/signals';
import type { TreeValidationResult } from '@angular/forms/signals';

interface LabM26Register {
  email: string;
}

function deferred(): { promise: Promise<void>; release: () => void } {
  let release = (): void => undefined;
  const promise = new Promise<void>((done) => {
    release = done;
  });
  return { promise, release };
}

@Component({
  selector: 'lab-m26-root-host',
  imports: [FormRoot],
  template: `
    <form id="f" [formRoot]="f">
      <button id="go" type="submit">Go</button>
    </form>
  `,
})
class LabM26RootHost {
  readonly model = signal<LabM26Register>({ email: '' });
  readonly calls: string[] = [];
  protected readonly f = form(
    this.model,
    (p) => {
      required(p.email);
    },
    {
      submission: {
        action: async (field): Promise<TreeValidationResult> => {
          this.calls.push(field().value().email);
          return undefined;
        },
      },
    },
  );
  readonly tree = this.f;
}

async function mount(): Promise<ComponentFixture<LabM26RootHost>> {
  const fixture = TestBed.createComponent(LabM26RootHost);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  return fixture;
}

function dispatchSubmit(fixture: ComponentFixture<LabM26RootHost>): Event {
  const event = new Event('submit', { cancelable: true });
  (fixture.nativeElement.querySelector('#f') as HTMLFormElement).dispatchEvent(event);
  return event;
}

describe('Section 7: submission', () => {
  it('Section 7: submit on an invalid form marks fields touched and skips the action', async () => {
    await TestBed.runInInjectionContext(async () => {
      const f = form(signal<LabM26Register>({ email: '' }), (p) => {
        required(p.email);
      });
      const calls: string[] = [];
      expect(f.email().touched()).toBe(false);
      const result = await submit(f, async () => {
        calls.push('ran');
        return undefined;
      });
      expect(result).toBe(false);
      expect(calls).toEqual([]);
      expect(f.email().touched()).toBe(true);
    });
  });

  it('Section 7: submitting is true while the action runs', async () => {
    await TestBed.runInInjectionContext(async () => {
      const f = form(signal<LabM26Register>({ email: 'a@b' }));
      const seen: boolean[] = [];
      expect(f().submitting()).toBe(false);
      const result = await submit(f, async () => {
        seen.push(f().submitting());
        return undefined;
      });
      expect(seen).toEqual([true]);
      expect(f().submitting()).toBe(false);
      expect(result).toBe(true);
    });
  });

  it("Section 7: an action's error lands on the targeted field", async () => {
    await TestBed.runInInjectionContext(async () => {
      const f = form(signal<LabM26Register>({ email: 'a@b' }));
      const result = await submit(f, async (field) => ({
        kind: 'server',
        message: 'taken',
        fieldTree: field.email,
      }));
      expect(result).toBe(false);
      expect(f.email().errors().map((e) => `${e.kind}:${e.message}`)).toEqual(['server:taken']);
      expect(f.email().valid()).toBe(false);
      expect(f().errors()).toEqual([]);
      expect(f().errorSummary().map((e) => e.kind)).toEqual(['server']);
    });
  });

  it('Section 7: editing the field clears the submission error', async () => {
    await TestBed.runInInjectionContext(async () => {
      const f = form(signal<LabM26Register>({ email: 'a@b' }));
      await submit(f, async (field) => ({ kind: 'server', fieldTree: field.email }));
      expect(f.email().errors().map((e) => e.kind)).toEqual(['server']);
      f.email().value.set('c@d');
      expect(f.email().errors()).toEqual([]);
      expect(f.email().valid()).toBe(true);
    });
  });

  it('Section 7: concurrent submits return false without running the action again', async () => {
    await TestBed.runInInjectionContext(async () => {
      const f = form(signal<LabM26Register>({ email: 'a@b' }));
      const held = deferred();
      let runs = 0;
      const action = async (): Promise<undefined> => {
        runs++;
        await held.promise;
        return undefined;
      };
      const first = submit(f, action);
      expect(f().submitting()).toBe(true);
      expect(await submit(f, action)).toBe(false);
      expect(runs).toBe(1);
      held.release();
      expect(await first).toBe(true);
      expect(runs).toBe(1);
    });
  });

  it('Section 7: FormRoot sets novalidate and prevents the native submit', async () => {
    const fixture = await mount();
    const element = fixture.nativeElement.querySelector('#f') as HTMLFormElement;
    expect(element.hasAttribute('novalidate')).toBe(true);
    const event = dispatchSubmit(fixture);
    expect(event.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.calls).toEqual([]);
    expect(fixture.componentInstance.tree.email().touched()).toBe(true);
  });

  it('Section 7: FormRoot runs the submission action when the form is valid', async () => {
    const fixture = await mount();
    fixture.componentInstance.model.set({ email: 'a@b' });
    dispatchSubmit(fixture);
    await fixture.whenStable();
    expect(fixture.componentInstance.calls).toEqual(['a@b']);
  });

  it('Section 7: onInvalid runs when validation fails', async () => {
    await TestBed.runInInjectionContext(async () => {
      const f = form(signal<LabM26Register>({ email: '' }), (p) => {
        required(p.email);
      });
      const log: string[] = [];
      const result = await submit(f, {
        action: async () => {
          log.push('action');
          return undefined;
        },
        onInvalid: (field) => {
          log.push(`invalid:${String(field.email().touched())}`);
        },
      });
      expect(result).toBe(false);
      expect(log).toEqual(['invalid:true']);
    });
  });

  it('Section 7: ignoreValidators none blocks a submit while a rule is pending', async () => {
    await TestBed.runInInjectionContext(async () => {
      const held = deferred();
      const f = form(signal<LabM26Register>({ email: 'a@b' }), (p) => {
        validateAsync(p.email, {
          params: ({ value }) => value(),
          factory: (params) =>
            resource({
              params,
              loader: async () => {
                await held.promise;
                return false;
              },
            }),
          onSuccess: () => undefined,
          onError: () => ({ kind: 'err' }),
        });
      });
      TestBed.tick();
      expect(f.email().pending()).toBe(true);
      const log: string[] = [];
      const action = async (): Promise<undefined> => {
        log.push('action');
        return undefined;
      };
      expect(await submit(f, { action, ignoreValidators: 'none' })).toBe(false);
      expect(log).toEqual([]);
      expect(await submit(f, action)).toBe(true);
      expect(log).toEqual(['action']);
      held.release();
    });
  });
});
