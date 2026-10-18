import { ApplicationRef, Component, computed, Injector, input, numberAttribute, output } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';

@Component({
  selector: 'lab-m37-s2-rating',
  template: `
    <span data-testid="stars">{{ maxStars() }}</span>
    <button type="button" (click)="ratingChanged.emit(maxStars())">Rate</button>
  `,
})
class LabM37S2Rating {
  readonly maxStars = input('0');
  readonly ratingChanged = output<string>();
}

@Component({
  selector: 'lab-m37-s2-types',
  template: `<span data-testid="raw">{{ rawType() }}</span> <span data-testid="num">{{ numType() }}</span>`,
})
class LabM37S2Types {
  readonly raw = input<unknown>();
  readonly num = input(0, { transform: numberAttribute });
  readonly rawType = computed(() => typeof this.raw());
  readonly numType = computed(() => typeof this.num());
}

@Component({
  selector: 'lab-m37-s2-slot',
  template: `<div data-testid="slot"><ng-content /></div>`,
})
class LabM37S2Slot {}

describe('Section 2: the element contract', () => {
  let appRef: ApplicationRef;
  let injector: Injector;

  beforeEach(async () => {
    appRef = await createApplication();
    injector = appRef.injector;
  });

  afterEach(() => {
    appRef.destroy();
  });

  it('Section 2: an attribute reaches a camelCase input through its kebab-case name', async () => {
    const elementClass = createCustomElement(LabM37S2Rating, { injector });
    customElements.define('m37-s2-rating', elementClass);
    expect(elementClass.observedAttributes).toContain('max-stars');

    const element = document.createElement('m37-s2-rating');
    element.setAttribute('max-stars', '5');
    document.body.append(element);
    await appRef.whenStable();

    expect(element.querySelector('[data-testid="stars"]')?.textContent).toBe('5');
    element.remove();
  });

  it('Section 2: an attribute arrives as a string unless the input has a transform', async () => {
    customElements.define('m37-s2-types', createCustomElement(LabM37S2Types, { injector }));
    const element = document.createElement('m37-s2-types');
    element.setAttribute('raw', '5');
    element.setAttribute('num', '5');
    document.body.append(element);
    await appRef.whenStable();

    expect(element.querySelector('[data-testid="raw"]')?.textContent).toBe('string');
    expect(element.querySelector('[data-testid="num"]')?.textContent).toBe('number');
    element.remove();
  });

  it('Section 2: an output is dispatched as a CustomEvent named after the output with the value in detail', async () => {
    customElements.define('m37-s2-event', createCustomElement(LabM37S2Rating, { injector }));
    const element = document.createElement('m37-s2-event');
    element.setAttribute('max-stars', '4');
    document.body.append(element);
    await appRef.whenStable();

    const received: Event[] = [];
    element.addEventListener('ratingChanged', (event) => received.push(event));
    element.addEventListener('rating-changed', (event) => received.push(event));
    element.querySelector('button')?.click();
    await appRef.whenStable();

    expect(received.length).toBe(1);
    expect(received[0]).toBeInstanceOf(CustomEvent);
    expect(received[0].type).toBe('ratingChanged');
    expect((received[0] as CustomEvent).detail).toBe('4');
    element.remove();
  });

  it('Section 2: the output event does not bubble to a parent listener', async () => {
    customElements.define('m37-s2-bubble', createCustomElement(LabM37S2Rating, { injector }));
    const parent = document.createElement('div');
    const element = document.createElement('m37-s2-bubble');
    parent.append(element);
    document.body.append(parent);
    await appRef.whenStable();

    let onElement = 0;
    let onParent = 0;
    element.addEventListener('ratingChanged', () => onElement++);
    parent.addEventListener('ratingChanged', () => onParent++);
    element.querySelector('button')?.click();
    await appRef.whenStable();

    expect(onElement).toBe(1);
    expect(onParent).toBe(0);
    parent.remove();
  });

  it('Section 2: children present at connect are projected and children appended later are not', async () => {
    customElements.define('m37-s2-slot', createCustomElement(LabM37S2Slot, { injector }));
    const element = document.createElement('m37-s2-slot');
    const early = document.createElement('span');
    early.textContent = 'early';
    element.append(early);
    document.body.append(element);
    await appRef.whenStable();

    const late = document.createElement('span');
    late.textContent = 'late';
    element.append(late);
    await appRef.whenStable();

    const slot = element.querySelector('[data-testid="slot"]');
    expect(slot?.textContent).toBe('early');
    expect(slot?.contains(late)).toBe(false);
    expect(late.parentElement).toBe(element);
    element.remove();
  });
});
