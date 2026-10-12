import { TestBed } from '@angular/core/testing';
import { PUBLISH_MS } from './quiet-ticker';
import { TickerHost } from './ticker-host';

// No `import 'zone.js'` here: this is the zoneless twin of quiet-feed.spec.ts, with the same components.
const settle = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

describe('E21.3 A quiet price feed in a zone-based app (zoneless twin)', () => {
  it('the ticker keeps working with the same code when the zone is removed', async () => {
    expect((globalThis as { Zone?: unknown }).Zone).toBeUndefined();
    const fixture = TestBed.createComponent(TickerHost);
    fixture.detectChanges();
    await settle(PUBLISH_MS * 4);
    await fixture.whenStable();

    const shown = Number(fixture.nativeElement.querySelector('.price').textContent);
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBe(fixture.componentInstance.ticker().price());
  });
});
