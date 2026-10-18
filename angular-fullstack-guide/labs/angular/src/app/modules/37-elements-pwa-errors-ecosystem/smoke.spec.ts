import { ApplicationRef, Component, input, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';

@Component({
  selector: 'lab-m37-smoke',
  template: `Hello, {{ name() }}`,
})
class LabM37Smoke {
  readonly name = input('world');
}

// jsdom has `customElements` but no `navigator.serviceWorker` (prediction F19; the run decides the title).
describe('Module 37 lab smoke', () => {
  it('Smoke: createCustomElement defines an element that renders under jsdom', async () => {
    const appRef: ApplicationRef = await createApplication();
    const injector: Injector = appRef.injector;
    customElements.define('m37-smoke', createCustomElement(LabM37Smoke, { injector }));

    const element = document.createElement('m37-smoke');
    element.setAttribute('name', 'jsdom');
    document.body.append(element);
    await appRef.whenStable();

    expect(element.textContent).toBe('Hello, jsdom');
    expect('serviceWorker' in navigator).toBe(false);
    element.remove();
    appRef.destroy();
  });
});
