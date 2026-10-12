import { ApplicationRef, provideCheckNoChangesConfig } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { LoaderHost } from './loader-host';
import { SlowSource } from './slow-source';

const app = () => TestBed.inject(ApplicationRef);
const isStable = () => firstValueFrom(app().isStable);
const settleTimers = () => new Promise<void>((resolve) => setTimeout(resolve, 20));
const textOf = (fixture: ComponentFixture<unknown>): string =>
  (fixture.nativeElement as HTMLElement).textContent?.trim() ?? '';

function render(keys: readonly string[] = ['a']) {
  const fixture = TestBed.createComponent(LoaderHost);
  fixture.componentRef.setInput('keys', keys);
  fixture.detectChanges();
  return { fixture, source: TestBed.inject(SlowSource) };
}

describe('E21.4 A loader that keeps the app unstable until it is done', () => {
  it('while loading, isStable is false and whenStable is pending', async () => {
    const { fixture } = render();
    expect(textOf(fixture)).toBe('loading');
    expect(await isStable()).toBe(false);

    let resolved = false;
    void app()
      .whenStable()
      .then(() => {
        resolved = true;
      });
    await settleTimers();
    expect(resolved).toBe(false);
  });

  it('after the load resolves, the text renders and whenStable resolves', async () => {
    const { fixture, source } = render();
    source.settle('a', 'done');
    await app().whenStable();

    expect(textOf(fixture)).toBe('done');
    expect(await isStable()).toBe(true);
  });

  it('a failing load releases the task and shows the error state', async () => {
    const { fixture, source } = render();
    source.fail('a', 'boom');
    await app().whenStable();

    expect(textOf(fixture)).toBe('boom');
    expect(await isStable()).toBe(true);
  });

  it('destroying the component mid-load releases the task', async () => {
    const { fixture, source } = render();
    expect(await isStable()).toBe(false);

    fixture.componentInstance.shown.set(false);
    await app().whenStable();

    expect(source.pending).toEqual(['a']);
    expect(textOf(fixture)).toBe('');
    expect(await isStable()).toBe(true);
  });

  it('two loads in parallel need both to finish', async () => {
    const { fixture, source } = render(['a', 'b']);
    source.settle('a', 'first');
    await settleTimers();
    expect(await isStable()).toBe(false);
    expect(textOf(fixture)).toBe('firstloading');

    source.settle('b', 'second');
    await app().whenStable();
    expect(textOf(fixture)).toBe('firstsecond');
    expect(await isStable()).toBe(true);
  });

  it('provideCheckNoChangesConfig({ exhaustive: true }) reports nothing on the loader', async () => {
    TestBed.configureTestingModule({
      providers: [provideCheckNoChangesConfig({ exhaustive: true })],
    });
    const { fixture, source } = render();
    source.settle('a', 'done');
    await app().whenStable();

    expect(() => app().tick()).not.toThrow();
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(textOf(fixture)).toBe('done');
  });
});
