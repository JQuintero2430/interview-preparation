import { Component, Injectable, input, signal, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

/** Session-style state: one instance for the whole injector. */
@Injectable({ providedIn: 'root' })
class LabM28Preferences {
  readonly theme = signal('light');
}

/** A draft: one instance per component that lists it in `providers`. */
@Injectable()
class LabM28Draft {
  readonly text = signal('');
  destroyed = false;

  ngOnDestroy(): void {
    this.destroyed = true;
  }
}

@Component({
  selector: 'lab-m28-draft-host',
  template: '{{ draft.text() }}',
  providers: [LabM28Draft],
})
class LabM28DraftHost {
  readonly draft = inject(LabM28Draft);
}

/** The filter lives in the URL: a routed component receives it as an input. */
@Component({
  selector: 'lab-m28-filter-page',
  template: '{{ q() }}',
})
class LabM28FilterPage {
  readonly q = input<string>();
  private readonly router = inject(Router);

  setFilter(value: string): Promise<boolean> {
    return this.router.navigate([], { queryParams: { q: value } });
  }
}

const routes = [{ path: 'list', component: LabM28FilterPage }];

describe('Section 1: kinds of state', () => {
  it('Section 1: state in a root service starts over when the injector is rebuilt', () => {
    TestBed.configureTestingModule({});
    TestBed.inject(LabM28Preferences).theme.set('dark');
    expect(TestBed.inject(LabM28Preferences).theme()).toBe('dark');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    expect(TestBed.inject(LabM28Preferences).theme()).toBe('light');
  });

  it('Section 1: a query parameter restores the filter when the same URL is opened again', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes, withComponentInputBinding())] });
    const first = await RouterTestingHarness.create();
    const page = await first.navigateByUrl('/list', LabM28FilterPage);
    expect(page.q()).toBeUndefined();

    await page.setFilter('pen');
    first.detectChanges();
    const url = TestBed.inject(Router).url;
    expect(url).toBe('/list?q=pen');
    expect(page.q()).toBe('pen');

    // A reload: a new injector, a new router, and nothing but the URL carried over.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideRouter(routes, withComponentInputBinding())] });
    const second = await RouterTestingHarness.create();
    const reopened = await second.navigateByUrl(url, LabM28FilterPage);
    expect(reopened.q()).toBe('pen');
  });

  it('Section 1: a draft provided by a component is gone after the component is destroyed', () => {
    TestBed.configureTestingModule({});
    const first = TestBed.createComponent(LabM28DraftHost);
    const draft = first.componentInstance.draft;
    draft.text.set('half-typed');
    first.detectChanges();
    expect(first.nativeElement.textContent).toBe('half-typed');

    first.destroy();
    expect(draft.destroyed).toBe(true);

    const second = TestBed.createComponent(LabM28DraftHost);
    second.detectChanges();
    expect(second.componentInstance.draft).not.toBe(draft);
    expect(second.componentInstance.draft.text()).toBe('');
  });
});
