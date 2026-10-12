import { Component, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

interface User {
  readonly name: string;
}

// --- Branches: one embedded view is alive at a time ---

@Component({
  selector: 'lab-m18-s1-branches',
  template: `
    @if (mode() === 'a') {
      <p id="a">A</p>
    } @else if (mode() === 'b') {
      <p id="b">B</p>
    } @else {
      <p id="c">C</p>
    }
  `,
})
class Branches {
  readonly mode = signal<'a' | 'b' | 'c'>('a');
}

// --- Truthiness ---

@Component({
  selector: 'lab-m18-s1-truthy',
  template: `@if (value()) {yes} @else {no}`,
})
class Truthy {
  readonly value = signal<unknown>(true);
}

// --- Alias: the branch view is kept while the condition stays truthy ---

let childConstructed = 0;

@Component({
  selector: 'lab-m18-s1-child',
  template: `{{ name() }}`,
})
class Child {
  readonly name = input.required<string>();
  constructor() {
    childConstructed++;
  }
}

@Component({
  selector: 'lab-m18-s1-alias',
  imports: [Child],
  template: `@if (user(); as u) { <p><lab-m18-s1-child [name]="u.name" /></p> }`,
})
class AliasHost {
  readonly user = signal<User | null>({ name: 'ann' });
}

// --- Alias on @else if holds the condition result ---

@Component({
  selector: 'lab-m18-s1-else-if-alias',
  template: `
    @if (user(); as u) {
      <p id="user">{{ u.name }}</p>
    } @else if (n() > 1; as big) {
      <p id="big">{{ big }}</p>
    } @else if (label(); as text) {
      <p id="label">{{ text }}</p>
    }
  `,
})
class ElseIfAlias {
  readonly user = signal<User | null>(null);
  readonly n = signal(2);
  readonly label = signal('tag');
}

function render<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}

function ids(root: HTMLElement): string[] {
  return Array.from(root.querySelectorAll('p')).map((p) => p.id);
}

describe('Section 1: the @if family', () => {
  beforeEach(() => {
    childConstructed = 0;
  });

  it('Section 1: only the matching branch is rendered', () => {
    const fixture = render(Branches);
    const root: HTMLElement = fixture.nativeElement;
    expect(ids(root)).toEqual(['a']);

    fixture.componentInstance.mode.set('b');
    fixture.detectChanges();
    expect(ids(root)).toEqual(['b']);

    fixture.componentInstance.mode.set('c');
    fixture.detectChanges();
    expect(ids(root)).toEqual(['c']);
  });

  it('Section 1: empty array, "0" and an empty object are truthy', () => {
    const fixture = render(Truthy);
    const root: HTMLElement = fixture.nativeElement;
    const rendered = (value: unknown): string => {
      fixture.componentInstance.value.set(value);
      fixture.detectChanges();
      return root.textContent?.trim() ?? '';
    };

    expect(rendered([])).toBe('yes');
    expect(rendered('0')).toBe('yes');
    expect(rendered({})).toBe('yes');
    expect(rendered(0)).toBe('no');
    expect(rendered('')).toBe('no');
    expect(rendered(null)).toBe('no');
    expect(rendered(NaN)).toBe('no');
    expect(rendered(undefined)).toBe('no');
  });

  it('Section 1: an alias change keeps the branch view and null destroys it', () => {
    const fixture = render(AliasHost);
    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('ann');
    expect(childConstructed).toBe(1);

    fixture.componentInstance.user.set({ name: 'bob' });
    fixture.detectChanges();
    expect(root.textContent).toContain('bob');
    expect(childConstructed).toBe(1);

    fixture.componentInstance.user.set(null);
    fixture.detectChanges();
    expect(root.querySelector('lab-m18-s1-child')).toBeNull();

    fixture.componentInstance.user.set({ name: 'cy' });
    fixture.detectChanges();
    expect(root.textContent).toContain('cy');
    expect(childConstructed).toBe(2);
  });

  it('Section 1: an @else if alias holds the condition result', () => {
    const fixture = render(ElseIfAlias);
    const root: HTMLElement = fixture.nativeElement;
    // n() > 1 is a boolean, so the alias is true, not the number 2.
    expect(root.querySelector('#big')?.textContent).toBe('true');

    fixture.componentInstance.n.set(0);
    fixture.detectChanges();
    expect(root.querySelector('#big')).toBeNull();
    // label() is a string, so the alias is the string itself.
    expect(root.querySelector('#label')?.textContent).toBe('tag');

    fixture.componentInstance.user.set({ name: 'ann' });
    fixture.detectChanges();
    expect(ids(root)).toEqual(['user']);
  });
});
