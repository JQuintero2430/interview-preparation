import {
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  Directive,
  Injectable,
  effect,
  inject,
  input,
  inputBinding,
  resource,
  signal,
} from '@angular/core';
import { TestBed, fakeAsync, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CanActivateFn, Router, provideRouter } from '@angular/router';

const RELATIVE_MOCK_MESSAGE =
  'The "vi.mock" and related methods are not supported for relative imports with the Angular unit-test system. ' +
  'Please use Angular TestBed for mocking dependencies.';

const CONFIGURE_AFTER_INJECT_MESSAGE =
  'Cannot configure the test module when the test module has already been instantiated. ' +
  'Make sure you are not using `inject` before `TestBed.configureTestingModule`.';

@Injectable({ providedIn: 'root' })
class LabM29Api {
  load(): string {
    return 'real';
  }
}

@Component({
  selector: 'lab-m29-greeting',
  template: '<p>{{ name() }}</p><b>x</b>',
})
class LabM29Greeting {
  readonly name = input('none');
}

// The default change detection strategy is OnPush: only a signal read, an input or markForCheck refreshes the view.
@Component({
  selector: 'lab-m29-pair',
  template: '<p>{{ plain }}|{{ sig() }}</p>',
})
class LabM29Pair {
  plain = 'a';
  readonly sig = signal('a');
}

@Component({
  selector: 'lab-m29-card',
  template:
    '<div class="card" (click)="log.push(\'card\')"><button type="button" (click)="log.push(\'button\')">go</button></div>',
})
class LabM29Card {
  readonly log: string[] = [];
}

interface LabM29Item {
  readonly id: number;
  readonly name: string;
}

@Injectable({ providedIn: 'root' })
class LabM29Catalog {
  load(): Promise<readonly LabM29Item[]> {
    return Promise.reject(new Error('the real service was reached'));
  }
}

@Component({
  selector: 'lab-m29-catalog-list',
  template: '{{ text() }}',
})
class LabM29CatalogList {
  protected readonly text = signal('loading');

  constructor() {
    void inject(LabM29Catalog)
      .load()
      .then((items) => this.text.set(items.map((item) => item.name).join(',')))
      .catch(() => this.text.set('failed'));
  }
}

@Directive({
  selector: '[labM29Hi]',
  host: { '[attr.data-hi]': 'labM29Hi()' },
})
class LabM29Hi {
  readonly labM29Hi = input('');
}

const NO_TAG_NAME =
  /^Cannot determine tag name for _?LabM29Hi, because one was not set in the options object and the selector for _?LabM29Hi does not include a tag name\. Specify which tag name should be used via the `tagName` key in the options parameter\.$/;

@Component({
  selector: 'lab-m29-slow-message',
  template: '{{ message() }}',
})
class LabM29SlowMessage {
  protected readonly message = signal('wait');

  constructor() {
    setTimeout(() => this.message.set('done'), 1000);
  }
}

const FAKE_ASYNC_MISSING =
  'zone-testing.js is needed for the fakeAsync() test helper but could not be found.\n' +
  `${' '.repeat(8)}Please make sure that your environment includes zone.js/testing`;
const WAIT_FOR_ASYNC_MISSING =
  'Zone is needed for the waitForAsync() test helper but could not be found. ' +
  'Please make sure that your environment includes zone.js';

describe('Q29 outputs', () => {
  it('Q29.05 a relative vi.doMock throws the builder message and a provider double replaces the service', () => {
    expect(() => vi.doMock('./api', () => ({ load: () => 'mocked' }))).toThrow(RELATIVE_MOCK_MESSAGE);
    expect(() => vi.doMock('rxjs', () => ({}))).not.toThrow();
    vi.doUnmock('rxjs');

    const load = vi.fn(() => 'double');
    TestBed.configureTestingModule({ providers: [{ provide: LabM29Api, useValue: { load } }] });

    expect(TestBed.inject(LabM29Api).load()).toBe('double');
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('Q29.09 configureTestingModule after TestBed.inject throws, and the instance injected before stays', () => {
    const early = TestBed.inject(LabM29Api);

    expect(() => TestBed.configureTestingModule({ providers: [] })).toThrow(CONFIGURE_AFTER_INJECT_MESSAGE);
    expect(TestBed.inject(LabM29Api)).toBe(early);
  });

  it('Q29.11 right after setInput the DOM holds only the static text, and after whenStable it holds the binding too', async () => {
    const fixture = TestBed.createComponent(LabM29Greeting);
    fixture.componentRef.setInput('name', 'Ada');

    expect(fixture.nativeElement.textContent).toBe('x');

    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('Adax');
  });

  it('Q29.13 a plain field write stays unrendered after detectChanges and whenStable, markForCheck shows it, and a signal write renders after whenStable', async () => {
    const fixture = TestBed.createComponent(LabM29Pair);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('a|a');

    fixture.componentInstance.plain = 'b';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('a|a');

    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('a|a');

    fixture.componentRef.injector.get(ChangeDetectorRef).markForCheck();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('b|a');

    fixture.componentInstance.sig.set('c');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('b|c');
  });

  it('Q29.16 triggerEventHandler runs only the button listener, and a native click runs the button then the card', async () => {
    const synthetic = TestBed.createComponent(LabM29Card);
    await synthetic.whenStable();
    synthetic.debugElement.query(By.css('button')).triggerEventHandler('click');

    const native = TestBed.createComponent(LabM29Card);
    await native.whenStable();
    native.debugElement.query(By.css('button')).nativeElement.click();

    expect(synthetic.componentInstance.log).toEqual(['button']);
    expect(native.componentInstance.log).toEqual(['button', 'card']);
  });

  it('Q29.19 a provider override with useValue renders the list, and mock.calls holds one call with no arguments', async () => {
    const items: readonly LabM29Item[] = [
      { id: 1, name: 'Pen' },
      { id: 2, name: 'Ink' },
    ];
    const load = vi.fn<LabM29Catalog['load']>().mockResolvedValue(items);
    TestBed.configureTestingModule({ providers: [{ provide: LabM29Catalog, useValue: { load } }] });

    const fixture = TestBed.createComponent(LabM29CatalogList);
    await vi.waitFor(() => expect(fixture.nativeElement.textContent).toBe('Pen,Ink'));

    expect(TestBed.inject(LabM29Catalog).load).toBe(load);
    expect(load.mock.calls).toEqual([[]]);
  });

  it('Q29.22 createDirective on an attribute selector throws without tagName, and with tagName a span host carries data-hi and ng-version', async () => {
    expect(() => TestBed.createDirective(LabM29Hi)).toThrowError(NO_TAG_NAME);

    const fixture = TestBed.createDirective(LabM29Hi, {
      tagName: 'span',
      bindings: [inputBinding('labM29Hi', () => 'yo')],
    });
    await fixture.whenStable();

    expect(fixture.nativeElement.tagName).toBe('SPAN');
    expect(fixture.nativeElement.getAttribute('data-hi')).toBe('yo');
    expect(fixture.nativeElement.getAttribute('ng-version')).toMatch(/^\d+\.\d+\.\d+/);
    expect(fixture.directiveInstance).toBeInstanceOf(LabM29Hi);
  });

  it('Q29.23 a guard run in an injection context returns the /login UrlTree, then true once its signal flips', () => {
    const isAdmin = signal(false);
    const adminGuard: CanActivateFn = () => isAdmin() || inject(Router).parseUrl('/login');
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const { snapshot } = TestBed.inject(Router).routerState;

    const before = TestBed.runInInjectionContext(() => adminGuard(snapshot.root, snapshot));
    isAdmin.set(true);
    const after = TestBed.runInInjectionContext(() => adminGuard(snapshot.root, snapshot));

    expect(String(before)).toBe('/login');
    expect(after).toBe(true);
  });

  it('Q29.26 an effect and a resource show nothing until TestBed.tick, and the resource resolves only after ApplicationRef.whenStable', async () => {
    const count = signal(0);
    const seen: number[] = [];
    TestBed.runInInjectionContext(() => effect(() => seen.push(count())));
    count.set(1);
    const id = signal(2);
    const doubled = TestBed.runInInjectionContext(() =>
      resource({ params: () => id(), loader: async ({ params }) => params * 2 }),
    );
    const snapshot = (): string => `${seen.join(',')}|${doubled.status()}|${String(doubled.value())}`;

    const afterSet = snapshot();
    TestBed.tick();
    const afterTick = snapshot();
    await TestBed.inject(ApplicationRef).whenStable();
    const afterStable = snapshot();

    expect(afterSet).toBe('|loading|undefined');
    expect(afterTick).toBe('1|loading|undefined');
    expect(afterStable).toBe('1|resolved|4');
  });

  it('Q29.28 whenStable stays pending on frozen fake timers, resolves after advanceTimersByTimeAsync(20), and the component timer fires after 1000 ms', async () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(LabM29SlowMessage);
      let resolved = false;
      const stable = fixture.whenStable().then(() => {
        resolved = true;
      });
      for (let turn = 0; turn < 5; turn++) {
        await Promise.resolve();
      }

      expect(resolved).toBe(false);
      expect(fixture.isStable()).toBe(false);
      expect(fixture.nativeElement.textContent).toBe('');

      await vi.advanceTimersByTimeAsync(20);
      await stable;

      expect(resolved).toBe(true);
      expect(fixture.nativeElement.textContent).toBe('wait');

      await vi.advanceTimersByTimeAsync(1000);

      expect(fixture.nativeElement.textContent).toBe('done');
    } finally {
      vi.useRealTimers();
    }
  });

  it('Q29.30 in a zoneless spec fakeAsync throws the zone-testing.js error and waitForAsync rejects with the Zone is needed string', async () => {
    expect(typeof Reflect.get(globalThis, 'Zone')).toBe('undefined');
    expect(() => fakeAsync(() => {})()).toThrow(FAKE_ASYNC_MISSING);

    // The typings declare one parameter (done: any), so the call passes undefined.
    const reason: unknown = await waitForAsync(() => {})(undefined).then(
      () => 'resolved',
      (error: unknown) => error,
    );

    expect(reason).toBe(WAIT_FOR_ASYNC_MISSING);
  });
});
