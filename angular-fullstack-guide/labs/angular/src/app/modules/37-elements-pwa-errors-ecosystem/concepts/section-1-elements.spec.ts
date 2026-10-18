import { ApplicationRef, Component, Injector, input } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';

@Component({
  selector: 'lab-m37-s1-hello',
  template: `Hello, {{ name() }}`,
})
class LabM37S1Hello {
  readonly name = input('world');
}

interface EarlyElement extends HTMLElement {
  name?: string;
}

describe('Section 1: Angular Elements', () => {
  let appRef: ApplicationRef;
  let injector: Injector;

  beforeEach(async () => {
    appRef = await createApplication();
    injector = appRef.injector;
  });

  afterEach(() => {
    appRef.destroy();
  });

  it('Section 1: createCustomElement returns a class the registry accepts', () => {
    const elementClass = createCustomElement(LabM37S1Hello, { injector });
    customElements.define('m37-s1-hello', elementClass);

    expect(customElements.get('m37-s1-hello')).toBe(elementClass);
  });

  it('Section 1: an element created with document.createElement renders the component once connected', async () => {
    customElements.define('m37-s1-render', createCustomElement(LabM37S1Hello, { injector }));
    const element = document.createElement('m37-s1-render');
    element.setAttribute('name', 'jsdom');
    expect(element.textContent).toBe('');

    document.body.append(element);
    await appRef.whenStable();

    expect(element.textContent).toBe('Hello, jsdom');
    element.remove();
  });

  it('Section 1: a property set before define reaches the component after upgrade', async () => {
    const element: EarlyElement = document.createElement('m37-s1-early');
    element.name = 'early';
    document.body.append(element);
    expect(element.textContent).toBe('');

    customElements.define('m37-s1-early', createCustomElement(LabM37S1Hello, { injector }));
    await appRef.whenStable();

    expect(element.textContent).toBe('Hello, early');
    element.remove();
  });
});
