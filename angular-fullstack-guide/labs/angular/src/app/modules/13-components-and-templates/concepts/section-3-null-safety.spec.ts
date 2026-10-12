import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

interface User {
  readonly name: string;
}

// Optional chaining on a nullish receiver; the third line is the migration aid the v22 schematic writes.
@Component({
  selector: 'lab-chain-values',
  template: `
    <p id="undefined">[{{ user()?.name === undefined }}]</p>
    <p id="null">[{{ user()?.name === null }}]</p>
    <p id="migration">[{{ $safeNavigationMigration(user()?.name) === null }}]</p>
    <p id="key">[{{ list()?.[0] === undefined }}]</p>
    <p id="call">[{{ run?.() === undefined }}]</p>
  `,
})
class ChainValues {
  protected readonly user = signal<User | null>(null);
  protected readonly list = signal<readonly string[] | null>(null);
  protected readonly run: (() => string) | undefined = undefined;
}

// The non-null assertion removes a type error and nothing else.
@Component({
  selector: 'lab-assertion-values',
  template: `<p id="name">{{ user()!.name }}</p>`,
})
class AssertionValues {
  protected readonly user = signal<User | null>(null);
}

@Component({
  selector: 'lab-assertion-present',
  template: `<p id="name">{{ user()!.name }}</p>`,
})
class AssertionPresent {
  protected readonly user = signal<User | null>({ name: 'Ada' });
}

// $any switches the type check off for one expression; the value is read as written.
@Component({
  selector: 'lab-any-values',
  template: `
    <p id="extra">{{ $any(user()).nickname }}</p>
  `,
})
class AnyValues {
  protected readonly user = signal<User>({ name: 'Ada', nickname: 'countess' } as User);
}

@Component({
  selector: 'lab-any-null',
  template: `<p id="missing">{{ $any(missing()).name }}</p>`,
})
class AnyNull {
  protected readonly missing = signal<User | null>(null);
}

function render<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

function texts(root: HTMLElement): Record<string, string> {
  return Object.fromEntries(
    Array.from(root.querySelectorAll('p[id]')).map((p) => [p.id, p.textContent ?? '']),
  );
}

describe('Section 3: safe navigation, the non-null assertion and $any', () => {
  it('Section 3: optional chaining on a nullish receiver evaluates to undefined', () => {
    const root = render(ChainValues);

    expect(texts(root)).toMatchObject({
      undefined: '[true]',
      null: '[false]',
      key: '[true]',
      call: '[true]',
    });
  });

  it('Section 3: $safeNavigationMigration keeps the null result', () => {
    const root = render(ChainValues);

    expect(texts(root)['migration']).toBe('[true]');
  });

  it('Section 3: the non-null assertion has no run-time effect and a null receiver still throws', () => {
    expect(() => render(AssertionValues)).toThrow(TypeError);
    expect(texts(render(AssertionPresent))).toEqual({ name: 'Ada' });
  });

  it('Section 3: $any changes only the type check', () => {
    expect(texts(render(AnyValues))).toEqual({ extra: 'countess' });
    expect(() => render(AnyNull)).toThrow(TypeError);
  });
});
