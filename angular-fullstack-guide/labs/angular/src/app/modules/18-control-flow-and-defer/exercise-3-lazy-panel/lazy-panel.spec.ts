import { ComponentFixture, DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { FailingPanelHost, LazyPanelHost, SlowPanelHost } from './lazy-panel-host';

type Seen = Partial<Record<'placeholder' | 'loading' | 'content' | 'error', number>>;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function element(fixture: ComponentFixture<unknown>, id: string): HTMLElement | null {
  const root: HTMLElement = fixture.nativeElement;
  return root.querySelector<HTMLElement>(`#${id}`);
}

/** Detects changes every few milliseconds and records when each sub-block is first seen. */
async function watch(fixture: ComponentFixture<unknown>, windowMs: number): Promise<Seen> {
  const seen: Seen = {};
  const start = performance.now();
  const sample = () => {
    fixture.detectChanges();
    for (const id of ['placeholder', 'loading', 'content', 'error'] as const) {
      if (seen[id] === undefined && element(fixture, id)) {
        seen[id] = performance.now() - start;
      }
    }
  };
  sample();
  while (performance.now() - start < windowMs) {
    await sleep(4);
    sample();
  }
  return seen;
}

// A margin for timers: a callback may run a few milliseconds early against a second clock.
const SLACK = 10;

const loaded = () => (globalThis as { labM18PanelLoaded?: string[] }).labM18PanelLoaded ?? [];

describe('E18.3 A lazy panel with placeholder, loading and error', () => {
  describe('real timers', () => {
    // First on purpose: a module is evaluated once per test file, so only the first load can show a side effect.
    it("hover prefetches the module without rendering it (the fixture's side effect is observed, the placeholder stays)", async () => {
      const fixture = TestBed.createComponent(LazyPanelHost);
      await watch(fixture, 60);
      expect(loaded()).toEqual([]);

      element(fixture, 'placeholder')!.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      const seen = await watch(fixture, 200);
      expect(loaded()).toEqual(['lab-m18-panel evaluated']);
      expect(seen.content).toBeUndefined();
      expect(element(fixture, 'placeholder')).not.toBeNull();
    });

    it('the placeholder shows first and a click renders the content', async () => {
      const fixture = TestBed.createComponent(LazyPanelHost);
      const before = await watch(fixture, 60);
      expect(before.placeholder).toBeLessThan(20);
      expect(before.content).toBeUndefined();

      element(fixture, 'placeholder')!.click();
      const after = await watch(fixture, 300);
      expect(after.content).toBeDefined();
      expect(element(fixture, 'placeholder')).toBeNull();
    });

    it('a slow load shows the loading block after the after delay and holds it for minimum', async () => {
      const fixture = TestBed.createComponent(SlowPanelHost);
      await watch(fixture, 20);
      element(fixture, 'placeholder')!.click();
      const seen = await watch(fixture, 500);
      expect(seen.loading).toBeGreaterThanOrEqual(40 - SLACK);
      expect(seen.content).toBeGreaterThan(seen.loading!);
      // The load ends near 120 ms; the loading block entered near 40 ms is held for 100 ms.
      expect(seen.content).toBeGreaterThanOrEqual(40 + 100 - SLACK);
    });

    it('a fast load never shows the loading block', async () => {
      const fixture = TestBed.createComponent(LazyPanelHost);
      await watch(fixture, 20);
      element(fixture, 'placeholder')!.click();
      const seen = await watch(fixture, 250);
      expect(seen.content).toBeDefined();
      expect(seen.loading).toBeUndefined();
    });

    it('a failing module renders the error block', async () => {
      const fixture = TestBed.createComponent(FailingPanelHost);
      await watch(fixture, 20);
      element(fixture, 'placeholder')!.click();
      const seen = await watch(fixture, 250);
      expect(seen.error).toBeDefined();
      expect(seen.content).toBeUndefined();
    });
  });

  describe('manual mode', () => {
    beforeEach(() => TestBed.configureTestingModule({ deferBlockBehavior: DeferBlockBehavior.Manual }));

    it('manual mode renders each state with getDeferBlocks and render', async () => {
      const fixture = TestBed.createComponent(LazyPanelHost);
      fixture.detectChanges();
      const [block] = await fixture.getDeferBlocks();
      expect(element(fixture, 'placeholder')).not.toBeNull();

      await block.render(DeferBlockState.Loading);
      expect(element(fixture, 'loading')).not.toBeNull();
      expect(element(fixture, 'placeholder')).toBeNull();

      await block.render(DeferBlockState.Complete);
      expect(element(fixture, 'content')).not.toBeNull();
      expect(element(fixture, 'loading')).toBeNull();

      const failed = TestBed.createComponent(LazyPanelHost);
      failed.detectChanges();
      const [failedBlock] = await failed.getDeferBlocks();
      await failedBlock.render(DeferBlockState.Error);
      expect(element(failed, 'error')).not.toBeNull();
      expect(element(failed, 'placeholder')).toBeNull();
    });
  });
});
