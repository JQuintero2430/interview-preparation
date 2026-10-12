import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { ResilientLoader, TableBackoffLoader } from './resilient-loader';

const URL = '/api/items/7';
const FALLBACK = { name: 'fallback' };

// The text solution and its table-backed alternative must pass every test below.
const LOADERS: Type<ResilientLoader>[] = [ResilientLoader, TableBackoffLoader];

function setup(loaderType: Type<ResilientLoader>) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  return { loader: TestBed.inject(loaderType), http: TestBed.inject(HttpTestingController) };
}

const fail = (http: HttpTestingController, status: number) => {
  const request = http.expectOne(URL);
  if (status === 0) {
    request.error(new ProgressEvent('error'));
  } else {
    request.flush('failed', { status, statusText: 'failed' });
  }
};

describe('E23.2 resilient loader', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('a 500 or a status 0 failure is retried with delays of 1, 2 and 4 seconds, then the error is replaced by the fallback', () => {
    for (const loaderType of LOADERS) {
      for (const status of [500, 0]) {
        const { loader, http } = setup(loaderType);
        const values: unknown[] = [];
        let completed = false;
        loader
          .load('7', () => FALLBACK)
          .subscribe({ next: (v) => values.push(v), complete: () => (completed = true) });
        for (const wait of [1000, 2000, 4000]) {
          fail(http, status);
          vi.advanceTimersByTime(wait - 1);
          http.expectNone(URL);
          vi.advanceTimersByTime(1);
        }
        expect(values).toEqual([]);
        fail(http, status);
        expect(values).toEqual([FALLBACK]);
        expect(completed).toBe(true);
        http.verify();
      }
    }
  });

  it('a 404 is not retried (one request) and gives the fallback at once', () => {
    for (const loaderType of LOADERS) {
      const { loader, http } = setup(loaderType);
      const values: unknown[] = [];
      loader.load('7', () => FALLBACK).subscribe((v) => values.push(v));
      fail(http, 404);
      expect(values).toEqual([FALLBACK]);
      expect(vi.getTimerCount()).toBe(0);
      http.verify();
    }
  });

  it('a success after one failure emits the value and makes no further request', () => {
    for (const loaderType of LOADERS) {
      const { loader, http } = setup(loaderType);
      const values: unknown[] = [];
      loader.load('7', () => FALLBACK).subscribe((v) => values.push(v));
      fail(http, 503);
      vi.advanceTimersByTime(1000);
      http.expectOne(URL).flush({ name: 'item' });
      vi.advanceTimersByTime(10_000);
      expect(values).toEqual([{ name: 'item' }]);
      http.verify();
    }
  });

  it('the loading flag is true while the request or a retry wait is pending and false after success, fallback or unsubscribe', () => {
    for (const loaderType of LOADERS) {
      const { loader, http } = setup(loaderType);
      expect(loader.loading()).toBe(false);

      const success = loader.load('7', () => FALLBACK).subscribe();
      expect(loader.loading()).toBe(true);
      fail(http, 500);
      expect(loader.loading()).toBe(true);
      vi.advanceTimersByTime(1000);
      http.expectOne(URL).flush({ name: 'item' });
      expect(loader.loading()).toBe(false);
      success.unsubscribe();

      loader.load('7', () => FALLBACK).subscribe();
      fail(http, 404);
      expect(loader.loading()).toBe(false);

      const cancelled = loader.load('7', () => FALLBACK).subscribe();
      expect(loader.loading()).toBe(true);
      cancelled.unsubscribe();
      expect(loader.loading()).toBe(false);
      expect(http.expectOne(URL).cancelled).toBe(true);
    }
  });

  it('unsubscribing during a retry wait cancels the wait and leaves no pending timer', () => {
    for (const loaderType of LOADERS) {
      const { loader, http } = setup(loaderType);
      const subscription: Subscription = loader.load('7', () => FALLBACK).subscribe();
      fail(http, 500);
      expect(vi.getTimerCount()).toBe(1);
      subscription.unsubscribe();
      expect(vi.getTimerCount()).toBe(0);
      vi.advanceTimersByTime(10_000);
      http.verify();
    }
  });

  it('the fallback is created per failure (a factory), not shared between calls', () => {
    for (const loaderType of LOADERS) {
      const { loader, http } = setup(loaderType);
      let created = 0;
      const results: { name: string }[] = [];
      const fallback = () => ({ name: `fallback-${++created}` });
      loader.load('7', fallback).subscribe((v) => results.push(v));
      fail(http, 404);
      loader.load('7', fallback).subscribe((v) => results.push(v));
      fail(http, 404);
      expect(results).toEqual([{ name: 'fallback-1' }, { name: 'fallback-2' }]);
      expect(results[0]).not.toBe(results[1]);
      http.verify();
    }
  });
});
