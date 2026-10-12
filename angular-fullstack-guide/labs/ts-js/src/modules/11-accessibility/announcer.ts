// A model of a live-region announcer in the style of the Angular CDK's LiveAnnouncer (read from @angular/cdk 22.2.1, not
// imported): regions exist before their content changes, a message is cleared first so an identical repeat still changes the
// text, and the text is written after a short delay. It writes DOM contents only; what a screen reader says is not modelled.
// Visually hiding the regions needs CSS that is out of scope here.

export type Politeness = 'polite' | 'assertive';

export interface Announcer {
  announce(message: string, politeness?: Politeness): void;
  destroy(): void;
}

export interface AnnouncerOptions {
  delayMs?: number;
  doc?: Document;
}

function createRegion(doc: Document, role: 'status' | 'alert', live: Politeness): HTMLElement {
  const region = doc.createElement('div');
  region.setAttribute('role', role);
  region.setAttribute('aria-live', live);
  region.setAttribute('aria-atomic', 'true');
  doc.body.append(region);
  return region;
}

export function createAnnouncer({ delayMs = 100, doc = document }: AnnouncerOptions = {}): Announcer {
  const regions: Record<Politeness, HTMLElement> = {
    polite: createRegion(doc, 'status', 'polite'),
    assertive: createRegion(doc, 'alert', 'assertive'),
  };
  const timers = new Map<Politeness, ReturnType<typeof setTimeout>>();

  return {
    announce(message: string, politeness: Politeness = 'polite'): void {
      const region = regions[politeness];
      region.textContent = '';
      clearTimeout(timers.get(politeness));
      timers.set(
        politeness,
        setTimeout(() => {
          region.textContent = message;
        }, delayMs),
      );
    },
    destroy(): void {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
      for (const region of Object.values(regions)) region.remove();
    },
  };
}
