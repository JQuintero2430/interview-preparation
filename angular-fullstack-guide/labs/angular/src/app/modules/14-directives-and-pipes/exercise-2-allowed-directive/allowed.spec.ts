import { Component, inject, OnDestroy } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Allowed, CurrentRoles } from './allowed';

let destroyed = 0;

@Component({ selector: 'lab-allowed-child', template: 'child' })
class Child implements OnDestroy {
  ngOnDestroy(): void {
    destroyed++;
  }
}

// The AOT test build type-checks this template: `roles.length` and `key.toUpperCase()` compile only
// because `ngTemplateContextGuard` types `let roles` and `let key = role` (compile-time, not asserted by a test).
@Component({
  selector: 'lab-allowed-host',
  imports: [Allowed, Child],
  template: `
    <div id="with-else">
      <p *labAllowed="'admin'; else denied; let roles; let key = role" id="main">
        {{ key.toUpperCase() }}:{{ roles.length }}<lab-allowed-child />
      </p>
      <ng-template #denied><p id="denied">denied</p></ng-template>
    </div>
    <div id="no-else"><p *labAllowed="'admin'" id="alone">alone</p></div>
  `,
})
class AllowedHost {
  readonly current = inject(CurrentRoles);
}

function setup(roles: readonly string[]) {
  TestBed.inject(CurrentRoles).roles.set(roles);
  const fixture = TestBed.createComponent(AllowedHost);
  fixture.detectChanges();
  const root: HTMLElement = fixture.nativeElement;
  const find = (selector: string) => root.querySelector(selector) as HTMLElement | null;
  const update = (next: readonly string[]) => {
    fixture.componentInstance.current.roles.set(next);
    fixture.detectChanges();
  };
  return { fixture, root, find, update };
}

describe('E14.2 A permission structural directive', () => {
  beforeEach(() => (destroyed = 0));

  it('the main template renders for an allowed role and the `else` template for a missing one', () => {
    const allowed = setup(['admin']);
    expect(allowed.find('#main')).not.toBeNull();
    expect(allowed.find('#denied')).toBeNull();
    TestBed.resetTestingModule();
    const missing = setup(['viewer']);
    expect(missing.find('#main')).toBeNull();
    expect(missing.find('#denied')).not.toBeNull();
  });

  it('changing the roles signal swaps the rendered template', () => {
    const { find, update } = setup(['viewer']);
    expect(find('#denied')).not.toBeNull();
    update(['admin']);
    expect(find('#main')).not.toBeNull();
    expect(find('#denied')).toBeNull();
    update([]);
    expect(find('#main')).toBeNull();
    expect(find('#denied')).not.toBeNull();
  });

  it('a change that keeps the answer `true` keeps the same DOM node (no recreation)', () => {
    const { find, update } = setup(['admin']);
    const before = find('#main');
    update(['admin', 'editor']);
    expect(find('#main')).toBe(before);
    expect(destroyed).toBe(0);
  });

  it('`let roles` reads the roles through `$implicit` and `role` reads the key through the context', () => {
    const { find, update } = setup(['admin']);
    expect(find('#main')!.textContent).toContain('ADMIN:1');
    update(['admin', 'editor']);
    expect(find('#main')!.textContent).toContain('ADMIN:2');
  });

  it('without an `else` template a denied user sees nothing and the container is empty', () => {
    const { find, update } = setup(['viewer']);
    const container = find('#no-else')!;
    expect(find('#alone')).toBeNull();
    expect(container.querySelector('p')).toBeNull();
    update(['admin']);
    expect(find('#alone')).not.toBeNull();
  });

  it('destroying the host destroys the embedded view (a `ngOnDestroy` of a child in the template runs once)', () => {
    const { fixture } = setup(['admin']);
    expect(destroyed).toBe(0);
    fixture.destroy();
    expect(destroyed).toBe(1);
  });
});
