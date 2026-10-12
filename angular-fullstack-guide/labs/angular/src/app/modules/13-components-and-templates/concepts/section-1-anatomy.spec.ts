import { Component, reflectComponentType } from '@angular/core';
import { TestBed } from '@angular/core/testing';

// The element-selector fixture: every <lab-anatomy-card> becomes a host element with its own view.
@Component({
  selector: 'lab-anatomy-card',
  template: `<p class="inside">{{ title }}</p>`,
})
class AnatomyCard {
  protected readonly title = 'view';
}

@Component({
  selector: 'lab-anatomy-host',
  imports: [AnatomyCard],
  template: `
    <lab-anatomy-card />
    <lab-anatomy-card />
    <section class="plain"><p>not a component</p></section>
  `,
})
class AnatomyHost {}

// One fixture per selector form. Each stamps data-hit on the element it matched, so the
// assertions need no template output (and work on void and text elements alike).
@Component({ selector: 'lab-sel-el', template: '', host: { 'data-hit': 'element' } })
class SelectorElement {}

@Component({ selector: '[lab-sel-attr]', template: '', host: { 'data-hit': 'attribute' } })
class SelectorAttribute {}

@Component({ selector: '.lab-sel-class', template: '', host: { 'data-hit': 'class' } })
class SelectorClass {}

@Component({
  selector: '[lab-sel-not]:not(textarea)',
  template: '',
  host: { 'data-hit': 'not' },
})
class SelectorNot {}

@Component({
  selector: 'lab-sel-list, [lab-sel-list]',
  template: '',
  host: { 'data-hit': 'list' },
})
class SelectorList {}

@Component({
  selector: 'lab-selectors-host',
  imports: [SelectorElement, SelectorAttribute, SelectorClass, SelectorNot, SelectorList],
  template: `
    <lab-sel-el id="el"></lab-sel-el>
    <div lab-sel-attr id="attr"></div>
    <div class="lab-sel-class" id="cls"></div>
    <div lab-sel-not id="not-div"></div>
    <textarea lab-sel-not id="not-textarea"></textarea>
    <lab-sel-list id="list-el"></lab-sel-list>
    <div lab-sel-list id="list-attr"></div>
    <div id="none"></div>
  `,
})
class SelectorsHost {}

// An attribute-selector component that its consumer does not list in imports.
@Component({
  selector: 'button[lab-primary]',
  template: `<ng-content />`,
  host: { class: 'primary', 'data-hit': 'primary' },
})
class PrimaryButton {}

@Component({
  selector: 'lab-imported-host',
  imports: [PrimaryButton],
  template: `<button lab-primary id="b">save</button>`,
})
class ImportedHost {}

@Component({
  selector: 'lab-forgot-import-host',
  template: `<button lab-primary id="b">save</button>`,
})
class ForgotImportHost {}

// Without styles (no styles, styleUrl or stylesheet), the encapsulation falls back to None.
@Component({ selector: 'lab-unstyled', template: `<p>plain</p>` })
class Unstyled {}

@Component({
  selector: 'lab-styled',
  template: `<p>scoped</p>`,
  styles: `
    p {
      color: teal;
    }
  `,
})
class Styled {}

@Component({
  selector: 'lab-anatomy-wrapper',
  imports: [Unstyled, Styled],
  template: `<lab-unstyled id="u" /><lab-styled id="s" />`,
})
class EncapsulationHost {}

// Members the template reads, with the three access levels the style guide discusses.
@Component({
  selector: 'lab-access-card',
  template: `<p id="access">{{ visible }}|{{ shielded }}|{{ hidden }}</p>`,
})
class AccessCard {
  readonly visible = 'public';
  protected readonly shielded = 'protected';
  private readonly hidden = 'private';
}

function render<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

function ids(root: HTMLElement, attribute: string): Record<string, string | null> {
  return Object.fromEntries(
    Array.from(root.querySelectorAll('[id]')).map((el) => [el.id, el.getAttribute(attribute)]),
  );
}

describe('Section 1: component anatomy', () => {
  it('Section 1: the element that matches the selector is the host and the template renders inside it', () => {
    const root = render(AnatomyHost);

    const hosts = root.querySelectorAll('lab-anatomy-card');
    expect(hosts.length).toBe(2);
    hosts.forEach((host) => {
      expect(host.children.length).toBe(1);
      expect(host.querySelector('p.inside')?.textContent).toBe('view');
    });
    expect(root.querySelector('section.plain')?.children.length).toBe(1);
    expect(root.querySelector('section.plain p')?.classList.contains('inside')).toBe(false);
  });

  it('Section 1: reflectComponentType reports the selector the compiler read from the metadata', () => {
    expect(reflectComponentType(AnatomyCard)?.selector).toBe('lab-anatomy-card');
    expect(reflectComponentType(SelectorNot)?.selector).toBe('[lab-sel-not]:not(textarea)');
  });

  it('Section 1: element, attribute, class and :not selectors each match as documented', () => {
    const root = render(SelectorsHost);

    expect(ids(root, 'data-hit')).toEqual({
      el: 'element',
      attr: 'attribute',
      cls: 'class',
      'not-div': 'not',
      'not-textarea': null,
      'list-el': 'list',
      'list-attr': 'list',
      none: null,
    });
  });

  it('Section 1: an attribute-selector component that is not imported renders as the plain native element', () => {
    const imported = render(ImportedHost).querySelector('#b');
    expect(imported?.getAttribute('data-hit')).toBe('primary');
    expect(imported?.classList.contains('primary')).toBe(true);

    const forgotten = render(ForgotImportHost).querySelector('#b');
    expect(forgotten?.tagName).toBe('BUTTON');
    expect(forgotten?.textContent).toBe('save');
    expect(forgotten?.getAttribute('data-hit')).toBeNull();
    expect(forgotten?.classList.contains('primary')).toBe(false);
  });

  it('Section 1: a component without styles has no host attribute because its encapsulation is None', () => {
    const root = render(EncapsulationHost);
    const attributeNames = (selector: string) =>
      (root.querySelector(selector) as HTMLElement).getAttributeNames();

    expect(attributeNames('#u').some((name) => name.startsWith('_nghost'))).toBe(false);
    expect(attributeNames('#u > p')).toEqual([]);
    expect(attributeNames('#s').some((name) => name.startsWith('_nghost'))).toBe(true);
    expect(attributeNames('#s > p').some((name) => name.startsWith('_ngcontent'))).toBe(true);
  });

  it('Section 1: a template reads public, protected and private members under the v22.2 compiler', () => {
    expect(render(AccessCard).querySelector('#access')?.textContent).toBe(
      'public|protected|private',
    );
  });
});
