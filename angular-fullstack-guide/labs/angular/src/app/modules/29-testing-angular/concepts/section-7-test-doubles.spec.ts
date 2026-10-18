import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, Injectable, InjectionToken, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

interface LabM29Item {
  readonly id: number;
  readonly name: string;
}

/** The real service types an array, but the API answers with an envelope: the mapping is missing. */
@Injectable({ providedIn: 'root' })
class LabM29Catalog {
  private readonly http = inject(HttpClient);

  load(): Promise<readonly LabM29Item[]> {
    return firstValueFrom(this.http.get<readonly LabM29Item[]>('/api/items'));
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

/** The port: what the preferences service needs from a store. */
interface LabM29Storage {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

const LAB_M29_STORAGE = new InjectionToken<LabM29Storage>('lab-m29-storage');

/** A fake: a working in-memory implementation of the port. */
class LabM29FakeStorage implements LabM29Storage {
  private readonly data = new Map<string, string>();

  get(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  set(key: string, value: string): void {
    this.data.set(key, value);
  }
}

@Injectable({ providedIn: 'root' })
class LabM29Prefs {
  private readonly storage = inject(LAB_M29_STORAGE);

  read(key: string): string {
    return this.storage.get(key) ?? 'default';
  }

  save(key: string, value: string): void {
    this.storage.set(key, value);
  }
}

class LabM29Speaker {
  greet(name: string): string {
    return `hi ${name}`;
  }
}

const ITEMS: readonly LabM29Item[] = [
  { id: 1, name: 'Pen' },
  { id: 2, name: 'Ink' },
];

describe('Section 7: test doubles', () => {
  afterEach(() => vi.restoreAllMocks());

  it('Section 7: a vi.fn stub returns canned values and records calls', async () => {
    const price = vi.fn<(sku: string) => number>().mockReturnValue(5);

    expect(price('a')).toBe(5);
    expect(price('b')).toBe(5);
    expect(price.mock.calls).toEqual([['a'], ['b']]);

    price.mockReturnValueOnce(9);
    expect(price('c')).toBe(9);
    expect(price('d')).toBe(5);

    const load = vi.fn<() => Promise<number>>().mockResolvedValue(42);
    await expect(load()).resolves.toBe(42);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('Section 7: vi.spyOn keeps the real object and is restored', () => {
    const speaker = new LabM29Speaker();
    const spy = vi.spyOn(speaker, 'greet');

    expect(speaker.greet('Ada')).toBe('hi Ada');
    expect(spy).toHaveBeenCalledWith('Ada');

    spy.mockReturnValue('stubbed');
    expect(speaker.greet('Bo')).toBe('stubbed');

    spy.mockRestore();
    expect(speaker.greet('Cy')).toBe('hi Cy');
    expect(vi.isMockFunction(speaker.greet)).toBe(false);

    vi.spyOn(speaker, 'greet').mockReturnValue('again');
    expect(speaker.greet('Di')).toBe('again');
    vi.restoreAllMocks();
    expect(speaker.greet('Di')).toBe('hi Di');
  });

  it('Section 7: a fake keeps behavior across calls', () => {
    TestBed.configureTestingModule({ providers: [{ provide: LAB_M29_STORAGE, useClass: LabM29FakeStorage }] });
    const prefs = TestBed.inject(LabM29Prefs);

    expect(prefs.read('theme')).toBe('default');
    prefs.save('theme', 'dark');
    prefs.save('size', 'large');
    expect(prefs.read('theme')).toBe('dark');
    expect(prefs.read('size')).toBe('large');
    prefs.save('theme', 'light');
    expect(prefs.read('theme')).toBe('light');

    const stub: LabM29Storage = { get: vi.fn<LabM29Storage['get']>().mockReturnValue('dark'), set: vi.fn() };
    expect(stub.get('theme')).toBe('dark');
    expect(stub.get('size')).toBe('dark');
  });

  it('Section 7: a provider override with useValue reaches the component', async () => {
    const load = vi.fn<LabM29Catalog['load']>().mockResolvedValue(ITEMS);
    TestBed.configureTestingModule({ providers: [{ provide: LabM29Catalog, useValue: { load } }] });

    const fixture = TestBed.createComponent(LabM29CatalogList);
    await vi.waitFor(() => expect(fixture.nativeElement.textContent).toBe('Pen,Ink'));

    expect(TestBed.inject(LabM29Catalog).load).toBe(load);
    expect(load.mock.calls).toEqual([[]]);
  });

  describe('with HTTP faked', () => {
    afterEach(() => TestBed.inject(HttpTestingController).verify());

    it('Section 7: an over-mocked test passes while the real service is broken', async () => {
      const load = vi.fn<LabM29Catalog['load']>().mockResolvedValue(ITEMS);
      TestBed.configureTestingModule({ providers: [{ provide: LabM29Catalog, useValue: { load } }] });
      const mocked = TestBed.createComponent(LabM29CatalogList);
      await vi.waitFor(() => expect(mocked.nativeElement.textContent).toBe('Pen,Ink'));
      expect(load).toHaveBeenCalledTimes(1);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
      const real = TestBed.createComponent(LabM29CatalogList);
      TestBed.inject(HttpTestingController).expectOne('/api/items').flush({ items: ITEMS });
      await vi.waitFor(() => expect(real.nativeElement.textContent).toBe('failed'));
    });
  });
});
