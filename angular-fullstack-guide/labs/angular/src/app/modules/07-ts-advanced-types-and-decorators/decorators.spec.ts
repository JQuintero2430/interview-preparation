import { Component, inject, Input, InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from '../../app';

const GREETING = new InjectionToken<string>('greeting', { factory: () => 'Hello' });

// Uses inject() instead of a constructor parameter decorator, so it needs no experimentalDecorators semantics.
@Component({ selector: 'lab-greeter', template: '{{ greeting }}' })
class Greeter {
  readonly greeting = inject(GREETING);
}

describe('Section 7: what Angular does with @Component', () => {
  it('Section 7: a component class carries static ɵcmp and ɵfac definitions, not a decorator call', () => {
    expect([typeof Reflect.get(App, 'ɵcmp'), typeof Reflect.get(App, 'ɵfac')]).toEqual(['object', 'function']);
  });

  it('Section 7: inject() resolves a typed token without any parameter decorator', async () => {
    const fixture = TestBed.createComponent(Greeter);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toBe('Hello');
  });

  it('Section 7: a standard field decorator call has no target, and the JIT runtime refuses it', () => {
    // Standard decorators call a field decorator as (undefined, context); the legacy shape passes the class prototype.
    const decorate: (target: unknown, context: unknown) => void = Input();
    expect(() => decorate(undefined, { kind: 'field', name: 'name' })).toThrow('Standard Angular field decorators are not supported in JIT mode.');
  });
});
