import { HttpClient, HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  ApplicationRef,
  Component,
  EnvironmentInjector,
  Injectable,
  createEnvironmentInjector,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CanActivateFn,
  Router,
  provideRouter,
  withComponentInputBinding,
  type Routes,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Store, createFeatureSelector, createSelector } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

/** A root service the routed guard reads. */
@Injectable({ providedIn: 'root' })
class LabM29Session {
  readonly admin = signal(false);
}

@Component({ selector: 'lab-m29-admin-page', template: '<p>admin page</p>' })
class LabM29AdminPage {}

@Component({ selector: 'lab-m29-login-page', template: '<p>login page</p>' })
class LabM29LoginPage {}

const labM29Routes: Routes = [
  {
    path: 'admin',
    component: LabM29AdminPage,
    canActivate: [() => inject(LabM29Session).admin() || inject(Router).parseUrl('/login')],
  },
  { path: 'login', component: LabM29LoginPage },
];

/** An interceptor that adds one header to every request. */
const labM29Auth: HttpInterceptorFn = (req, next) =>
  next(req.clone({ setHeaders: { Authorization: 'Bearer lab-token' } }));

/** A form whose error message depends on the control being touched. */
@Component({
  selector: 'lab-m29-name-form',
  imports: [ReactiveFormsModule],
  template: `
    <label for="lab-m29-name">Name</label>
    <input id="lab-m29-name" [formControl]="nameControl" />
    @if (nameControl.touched && nameControl.invalid) {
      <p role="alert">At least 3 characters</p>
    }
  `,
})
class LabM29NameForm {
  readonly nameControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)],
  });
}

const labM29SelectTotal = createSelector(
  createFeatureSelector<{ count: number }>('cart'),
  (cart) => cart.count * 10,
);

/** A component that reads one selector through the store. */
@Component({ selector: 'lab-m29-total', template: '<p>{{ total() }}</p>' })
class LabM29Total {
  protected readonly total = inject(Store).selectSignal(labM29SelectTotal);
}

describe('Section 9: guards, interceptors, forms, effects, resources and stores', () => {
  it('Section 9: a functional guard runs inside runInInjectionContext', () => {
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

  it('Section 9: a guard tested through RouterTestingHarness lands on the redirect', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(labM29Routes, withComponentInputBinding())],
    });
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/admin');

    expect(TestBed.inject(Router).url).toBe('/login');
    expect(harness.routeNativeElement?.textContent).toBe('login page');
  });

  describe('with HTTP faked', () => {
    afterEach(() => TestBed.inject(HttpTestingController).verify());

    it('Section 9: an interceptor adds its header to a request seen by HttpTestingController', () => {
      TestBed.configureTestingModule({
        providers: [provideHttpClient(withInterceptors([labM29Auth])), provideHttpClientTesting()],
      });

      TestBed.inject(HttpClient).get('/api/x').subscribe();

      const request = TestBed.inject(HttpTestingController).expectOne('/api/x');
      expect(request.request.headers.get('Authorization')).toBe('Bearer lab-token');
      request.flush({});
    });

    it("Section 9: a feature's own HttpClient needs its own testing backend", () => {
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting()],
      });
      const child = createEnvironmentInjector(
        [provideHttpClient(), provideHttpClientTesting()],
        TestBed.inject(EnvironmentInjector),
      );
      const rootController = TestBed.inject(HttpTestingController);
      const childController = child.get(HttpTestingController);

      child.get(HttpClient).get('/api/x').subscribe();

      expect(childController).not.toBe(rootController);
      expect(rootController.match(() => true)).toHaveLength(0);
      expect(childController.match('/api/x')).toHaveLength(1);
    });
  });

  it('Section 9: a reactive form is driven through input events', async () => {
    const fixture = TestBed.createComponent(LabM29NameForm);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const alert = (): HTMLElement | null => fixture.nativeElement.querySelector('[role="alert"]');

    input.value = 'ab';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.nameControl.value).toBe('ab');
    expect(fixture.componentInstance.nameControl.dirty).toBe(true);
    expect(alert()).toBeNull();

    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();

    expect(alert()?.textContent).toBe('At least 3 characters');

    input.value = 'abc';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(alert()).toBeNull();
  });

  it('Section 9: an effect runs after TestBed.tick', () => {
    const count = signal(0);
    const seen: number[] = [];
    TestBed.runInInjectionContext(() => effect(() => seen.push(count())));
    expect(seen).toEqual([]);

    TestBed.tick();
    count.set(1);
    expect(seen).toEqual([0]);

    TestBed.tick();
    expect(seen).toEqual([0, 1]);
  });

  it('Section 9: a resource value lands after ApplicationRef.whenStable', async () => {
    const id = signal(2);
    const doubled = TestBed.runInInjectionContext(() =>
      resource({ params: () => id(), loader: async ({ params }) => params * 2 }),
    );
    expect(doubled.value()).toBeUndefined();

    TestBed.tick();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(doubled.status()).toBe('resolved');
    expect(doubled.value()).toBe(4);
  });

  it('Section 9: a component reading an NgRx store renders a MockStore selector override', async () => {
    TestBed.configureTestingModule({ providers: [provideMockStore({ initialState: { cart: { count: 1 } } })] });
    const store = TestBed.inject(MockStore);
    try {
      const fixture = TestBed.createComponent(LabM29Total);
      await fixture.whenStable();
      expect(fixture.nativeElement.textContent).toBe('10');

      store.overrideSelector(labM29SelectTotal, 99);
      store.refreshState();
      await fixture.whenStable();

      expect(fixture.nativeElement.textContent).toBe('99');
    } finally {
      store.resetSelectors();
    }
  });
});
