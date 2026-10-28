import type { Type, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  LAB_M31_PRODUCT_COUNT,
  LabM31ListRuns,
  LabM31ProductList,
  LabM31ProductListPipe,
} from './product-list';

/** What both variants expose to the test: the three signals that drive them. */
interface ListUnderTest {
  readonly query: WritableSignal<string>;
  readonly ascending: WritableSignal<boolean>;
  readonly clock: WritableSignal<number>;
}

/** Each test renders the full list in jsdom, which can pass Vitest's 5 s default on a busy machine. */
const SLOW_RENDER = { timeout: 30_000 };

const variants: [string, Type<ListUnderTest>][] = [
  ['computed signals', LabM31ProductList],
  ['pure pipe', LabM31ProductListPipe],
];

/** Renders a variant, waits for the first stable point and zeroes the counts. */
async function render(component: Type<ListUnderTest>): Promise<ComponentFixture<ListUnderTest>> {
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  await fixture.whenStable();
  TestBed.inject(LabM31ListRuns).reset();
  return fixture;
}

async function search(fixture: ComponentFixture<ListUnderTest>, query: string): Promise<void> {
  fixture.componentInstance.query.set(query);
  await fixture.whenStable();
}

function rows(fixture: ComponentFixture<ListUnderTest>): HTMLLIElement[] {
  const host: HTMLElement = fixture.nativeElement;
  return Array.from(host.querySelectorAll('li'));
}

function rowNamed(fixture: ComponentFixture<ListUnderTest>, name: string): HTMLLIElement {
  const row = rows(fixture).find((item) => item.textContent === name);
  if (!row) {
    throw new Error(`No row named ${name}`);
  }
  return row;
}

function totalText(fixture: ComponentFixture<ListUnderTest>): string | null | undefined {
  const host: HTMLElement = fixture.nativeElement;
  return host.querySelector('.total')?.textContent;
}

describe.each(variants)('E31.1 fast product list (%s)', SLOW_RENDER, (_label, component) => {
  it('shows the products that match the query', async () => {
    const fixture = await render(component);
    expect(rows(fixture)).toHaveLength(LAB_M31_PRODUCT_COUNT);

    await search(fixture, 'Product 12');

    // Product 12, Product 120 to 129 and Product 1200 to 1299.
    const names = rows(fixture).map((row) => row.textContent);
    expect(names).toHaveLength(111);
    expect(names[0]).toBe('Product 12');
    expect(names[110]).toBe('Product 1299');
  });

  it('recomputes the filter once per query change', async () => {
    const fixture = await render(component);
    const runs = TestBed.inject(LabM31ListRuns);

    await search(fixture, 'Product 12');
    expect(runs.filter).toBe(1);

    runs.reset();
    await search(fixture, 'Product 13');
    expect(runs.filter).toBe(1);
  });

  it('does not recompute when an unrelated signal changes', async () => {
    const fixture = await render(component);
    const runs = TestBed.inject(LabM31ListRuns);

    for (let i = 0; i < 3; i++) {
      fixture.componentInstance.clock.update((n) => n + 1);
      await fixture.whenStable();
    }

    expect(runs.filter).toBe(0);
    expect(runs.total).toBe(0);
    expect(rows(fixture)).toHaveLength(LAB_M31_PRODUCT_COUNT);
  });

  it("keeps each row's DOM node when the list is re-sorted", async () => {
    const fixture = await render(component);
    await search(fixture, 'Product 12');
    const held = rowNamed(fixture, 'Product 120');

    fixture.componentInstance.ascending.set(false);
    await fixture.whenStable();

    const after = rows(fixture);
    expect(after[0].textContent).toBe('Product 1299');
    expect(after).toContain(held);
    expect(held.isConnected).toBe(true);
    expect(held.textContent).toBe('Product 120');
  });

  it('shows the total of the visible products', async () => {
    const fixture = await render(component);
    expect(totalText(fixture)).toBe('Total: 15000');

    await search(fixture, 'Product 12');

    // Prices are id % 5 + 1: 3 for Product 12, 30 for 120 to 129, 300 for 1200 to 1299.
    expect(totalText(fixture)).toBe('Total: 333');
  });
});
