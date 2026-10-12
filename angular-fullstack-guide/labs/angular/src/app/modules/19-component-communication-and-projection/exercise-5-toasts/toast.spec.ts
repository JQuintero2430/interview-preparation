import { ApplicationRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { toastLog } from './toast';
import { ToastService } from './toast-service';

const hosts = (): HTMLElement[] => Array.from(document.body.querySelectorAll<HTMLElement>('lab-m19-toast'));

function setup(): { service: ToastService; appRef: ApplicationRef } {
  return { service: TestBed.inject(ToastService), appRef: TestBed.inject(ApplicationRef) };
}

describe('E19.5 A toast service with dynamic components', () => {
  beforeEach(() => {
    toastLog.created = 0;
    toastLog.destroyed = 0;
  });

  // The toasts live in document.body, outside the fixture, so the spec removes them itself.
  afterEach(() => {
    TestBed.inject(ToastService).dismissAll();
    hosts().forEach((host) => host.remove());
  });

  it('show renders one toast with its message in the document', () => {
    const { service, appRef } = setup();
    service.show('Saved');
    appRef.tick();
    expect(hosts().length).toBe(1);
    expect(hosts()[0].querySelector('.message')?.textContent).toBe('Saved');
    expect(service.count()).toBe(1);
  });

  it("the toast's dismissed output removes it from the DOM and from count()", () => {
    const { service, appRef } = setup();
    service.show('Saved');
    appRef.tick();
    hosts()[0].querySelector<HTMLButtonElement>('.close')?.click();
    appRef.tick();
    expect(hosts().length).toBe(0);
    expect(service.count()).toBe(0);
  });

  it('count() equals the number of live toast components after any sequence of show and dismiss calls', () => {
    const { service, appRef } = setup();
    const live = (): number => toastLog.created - toastLog.destroyed;
    const dismissFirst = (): void => hosts()[0].querySelector<HTMLButtonElement>('.close')?.click();
    const steps = [() => service.show('a'), () => service.show('b'), dismissFirst, () => service.show('c')];
    for (const step of steps) {
      step();
      appRef.tick();
      expect(service.count()).toBe(live());
      expect(hosts().length).toBe(live());
    }
    expect(service.count()).toBe(2);
  });

  it('dismissAll destroys every component (each ngOnDestroy runs once) and detaches its view', () => {
    const { service, appRef } = setup();
    const before = appRef.viewCount;
    ['a', 'b', 'c'].forEach((m) => service.show(m));
    appRef.tick();
    expect(appRef.viewCount).toBe(before + 3);
    service.dismissAll();
    service.dismissAll();
    expect(toastLog).toEqual({ created: 3, destroyed: 3 });
    expect(appRef.viewCount).toBe(before);
    expect(hosts().length).toBe(0);
    expect(service.count()).toBe(0);
  });

  it('custom content passed as projectable nodes appears in the toast body', () => {
    const { service, appRef } = setup();
    const undo = document.createElement('b');
    undo.textContent = 'Undo';
    service.show('Deleted', { content: [undo] });
    appRef.tick();
    expect(hosts()[0].querySelector('.content b')?.textContent).toBe('Undo');
  });

  it('the message input follows a signal', () => {
    const { service, appRef } = setup();
    const message = signal('first');
    service.show(message);
    appRef.tick();
    expect(hosts()[0].querySelector('.message')?.textContent).toBe('first');
    message.set('second');
    appRef.tick();
    expect(hosts()[0].querySelector('.message')?.textContent).toBe('second');
  });
});
