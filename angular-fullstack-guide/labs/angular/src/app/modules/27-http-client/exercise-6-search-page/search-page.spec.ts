import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabM27SearchPage, LabM27SearchPageSwitch, SEARCH_URL } from './search-page';

const variants: [string, Type<LabM27SearchPage>][] = [
  ['@if chain', LabM27SearchPage],
  ['@switch on status', LabM27SearchPageSwitch],
];

describe.each(variants)('E27.6 search page with httpResource (%s)', (_name, component) => {
  function mount(): { fixture: ComponentFixture<LabM27SearchPage>; controller: HttpTestingController } {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const fixture = TestBed.createComponent(component);
    fixture.autoDetectChanges();
    return { fixture, controller: TestBed.inject(HttpTestingController) };
  }

  /** Types into the box and runs the effects, so the resource issues its request before the test looks. */
  function type(fixture: ComponentFixture<LabM27SearchPage>, text: string): void {
    const box = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    box.value = text;
    box.dispatchEvent(new Event('input'));
    TestBed.tick();
  }

  function text(fixture: ComponentFixture<LabM27SearchPage>, selector: string): string | null {
    const element: HTMLElement = fixture.nativeElement;
    return element.querySelector(selector)?.textContent?.trim() ?? null;
  }

  function searchRequest(controller: HttpTestingController): TestRequest {
    return controller.expectOne((req) => req.url === SEARCH_URL);
  }

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('a query shorter than two characters sends no request and shows the hint', () => {
    const { fixture, controller } = mount();
    TestBed.tick();
    expect(text(fixture, '.hint')).toBe('Type at least 2 characters');
    type(fixture, 'n');
    expect(text(fixture, '.hint')).toBe('Type at least 2 characters');
    expect(text(fixture, '.loading')).toBeNull();
    controller.expectNone(() => true);
  });

  it('typing a query sends one request with q as a parameter', () => {
    const { fixture, controller } = mount();
    type(fixture, 'ng');
    const request = searchRequest(controller);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('q')).toBe('ng');
    expect(request.request.urlWithParams).toBe('/api/search?q=ng');
    expect(controller.match(() => true)).toHaveLength(0);
    request.flush([]);
  });

  it('while the request runs the page shows loading', async () => {
    const { fixture, controller } = mount();
    type(fixture, 'ng');
    const request = searchRequest(controller);
    expect(text(fixture, '.loading')).toBe('Searching…');
    expect(text(fixture, '.hint')).toBeNull();
    request.flush([]);
    await fixture.whenStable();
    expect(text(fixture, '.loading')).toBeNull();
  });

  it('results render as a list', async () => {
    const { fixture, controller } = mount();
    type(fixture, 'sig');
    searchRequest(controller).flush([
      { id: 1, title: 'Signals' },
      { id: 2, title: 'Signal Forms' },
    ]);
    await fixture.whenStable();
    const items = Array.from(fixture.nativeElement.querySelectorAll('ul.results li'), (li: Element) => li.textContent?.trim());
    expect(items).toEqual(['Signals', 'Signal Forms']);
    expect(text(fixture, '.empty')).toBeNull();
  });

  it('an empty result shows the empty state', async () => {
    const { fixture, controller } = mount();
    type(fixture, 'zz');
    searchRequest(controller).flush([]);
    await fixture.whenStable();
    expect(text(fixture, '.empty')).toBe('No results for "zz"');
    expect(fixture.nativeElement.querySelector('ul.results')).toBeNull();
  });

  it('a server error shows the mapped error message', async () => {
    const { fixture, controller } = mount();
    type(fixture, 'ng');
    searchRequest(controller).flush({ message: 'db down' }, { status: 503, statusText: 'Service Unavailable' });
    await fixture.whenStable();
    expect(text(fixture, '.error')).toBe('Search is unavailable right now. Try again later.');
    expect(text(fixture, '.loading')).toBeNull();
    expect(text(fixture, '.empty')).toBeNull();
  });

  it('a new query cancels the previous request', async () => {
    const { fixture, controller } = mount();
    type(fixture, 'ng');
    const first = searchRequest(controller);
    expect(first.cancelled).toBe(false);
    type(fixture, 'ngx');
    expect(first.cancelled).toBe(true);
    const second = searchRequest(controller);
    expect(second.request.params.get('q')).toBe('ngx');
    second.flush([{ id: 3, title: 'ngx-translate' }]);
    await fixture.whenStable();
    expect(text(fixture, 'ul.results li')).toBe('ngx-translate');
  });
});
