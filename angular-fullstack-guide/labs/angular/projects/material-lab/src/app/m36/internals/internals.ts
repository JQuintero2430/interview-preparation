import { Component, DestroyRef, Injector, inject, input, signal } from '@angular/core';
import {
  type ConnectedPosition,
  type OverlayConfig,
  type OverlayRef,
  createFlexibleConnectedPositionStrategy,
  createGlobalPositionStrategy,
  createOverlayRef,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { MatButton } from '@angular/material/button';

const BELOW: ConnectedPosition[] = [{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }];

/** The content of every overlay on the page, attached through a ComponentPortal. */
@Component({
  selector: 'lab-m36-internals-panel',
  host: { class: 'm36-internals-panel', role: 'group', '[attr.aria-label]': 'label()' },
  template: `<p>{{ label() }}</p>`,
})
class LabM36InternalsPanel {
  readonly label = input.required<string>();
}

/**
 * The two pipelines of section 13: overlays that show the dispatcher stack and the popover insertion point,
 * and three filled buttons that show the fallback chain from the component token to the system variable.
 */
@Component({
  selector: 'lab-m36-internals',
  imports: [MatButton],
  host: { class: 'm36-internals' },
  template: `
    <h1>Section 13: under the hood</h1>

    <section aria-labelledby="m36-internals-stack">
      <h2 id="m36-internals-stack">Dispatcher stack</h2>
      <div class="m36-internals-row">
        <button matButton="outlined" type="button" (click)="openStacked('First overlay', '2rem', true)">Open first overlay</button>
        <button matButton="outlined" type="button" (click)="openStacked('Second overlay', '16rem', true)">Open second overlay</button>
        <button matButton="outlined" type="button" (click)="openStacked('Unwired overlay', '30rem', false)">Open unwired overlay</button>
      </div>
      <ol aria-label="Escape log">
        @for (name of escapeLog(); track $index) {
          <li>{{ name }}</li>
        }
      </ol>
    </section>

    <section aria-labelledby="m36-internals-insertion">
      <h2 id="m36-internals-insertion">Insertion point</h2>
      <div class="m36-internals-row">
        <button matButton="outlined" type="button" (click)="openCover()">Open cover</button>
        <button matButton="outlined" type="button" class="m36-internals-origin" (click)="openInline($event)">Open inline menu</button>
      </div>
    </section>

    <section aria-labelledby="m36-internals-chain">
      <h2 id="m36-internals-chain">Fallback chain</h2>
      <div class="m36-internals-row">
        <div role="group" aria-label="Theme default"><button matButton="filled" type="button">Save</button></div>
        <div role="group" aria-label="System variable set" class="m36-internals-sys">
          <button matButton="filled" type="button">Save</button>
        </div>
        <div role="group" aria-label="Component token set" class="m36-internals-token">
          <button matButton="filled" type="button">Save</button>
        </div>
      </div>
    </section>
  `,
})
export class LabM36Internals {
  private readonly injector = inject(Injector);
  private readonly refs = new Set<OverlayRef>();
  /** The label of each overlay that received an Escape keydown, in the order they received it. */
  protected readonly escapeLog = signal<string[]>([]);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.refs.forEach((ref) => ref.dispose()));
  }

  /** A global overlay; `wired` decides whether it subscribes to keydownEvents(), which is what makes the dispatcher deliver to it. */
  protected openStacked(label: string, left: string, wired: boolean): void {
    const ref = this.show(label, { positionStrategy: createGlobalPositionStrategy(this.injector).top('14rem').left(left) });
    if (!wired) return;
    ref.keydownEvents().subscribe((event) => {
      if (event.key !== 'Escape') return;
      this.escapeLog.update((log) => [...log, label]);
      ref.dispose();
    });
  }

  /** A global overlay whose pane fills the viewport; its host goes into the overlay container. */
  protected openCover(): void {
    this.show('Cover', {
      positionStrategy: createGlobalPositionStrategy(this.injector),
      width: '100%',
      height: '100%',
      panelClass: 'm36-internals-cover',
    });
  }

  /** A connected overlay whose strategy names an insertion point: 'inline' puts the host right after the origin. */
  protected openInline(event: Event): void {
    const origin = event.currentTarget;
    if (!(origin instanceof HTMLElement)) return;
    const positionStrategy = createFlexibleConnectedPositionStrategy(this.injector, origin)
      .withPositions(BELOW)
      .withFlexibleDimensions(false)
      .withPush(false)
      .withPopoverLocation('inline');
    this.show('Inline menu', { positionStrategy });
  }

  private show(label: string, config: OverlayConfig): OverlayRef {
    const ref = createOverlayRef(this.injector, config);
    ref.attach(new ComponentPortal(LabM36InternalsPanel)).setInput('label', label);
    this.refs.add(ref);
    ref.detachments().subscribe(() => this.refs.delete(ref));
    return ref;
  }
}
