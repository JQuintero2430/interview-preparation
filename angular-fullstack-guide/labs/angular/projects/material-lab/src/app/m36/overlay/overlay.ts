import { Component, DestroyRef, Injector, inject, input } from '@angular/core';
import {
  type ConnectedPosition,
  type OverlayRef,
  type PositionStrategy,
  createFlexibleConnectedPositionStrategy,
  createGlobalPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { MatButton } from '@angular/material/button';

/** What closes an overlay: a click outside it, the Escape key, or nothing (nobody subscribed). */
type Dismiss = 'outside' | 'escape' | 'none';

/** The first position that fits the viewport wins; each one tags the pane with a class the tests read. */
const BELOW_THEN_ABOVE: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', panelClass: 'm36-below' },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', panelClass: 'm36-above' },
];

/** The content every overlay of the page shows, attached through a ComponentPortal. */
@Component({
  selector: 'lab-m36-panel',
  host: { class: 'm36-panel', role: 'group', '[attr.aria-label]': 'label()' },
  template: `
    <p>{{ label() }}</p>
    <button type="button">Inside</button>
  `,
})
class LabM36Panel {
  readonly label = input.required<string>();
}

/** Raw overlays built with the `create*` functions: a global one, connected ones, and three ways of dismissing. */
@Component({
  selector: 'lab-m36-overlay',
  imports: [MatButton],
  host: { class: 'm36-overlay-page' },
  template: `
    <header class="m36-sticky">Sticky header, z-index 2147483647</header>
    <h1>Section 5: portals and overlays</h1>

    <div class="m36-row">
      <button matButton="outlined" type="button" (click)="openNote()">Open note</button>
      <button matButton="outlined" type="button" (click)="openStacked('First overlay', '2rem', 'escape')">Open first overlay</button>
      <button matButton="outlined" type="button" (click)="openStacked('Second overlay', '18rem', 'escape')">Open second overlay</button>
      <button matButton="outlined" type="button" (click)="openStacked('Unwired overlay', '34rem', 'none')">Open unwired overlay</button>
    </div>

    <!-- The clip hides anything that overflows it; the overlay is not inside it. -->
    <div class="m36-clip">
      <button matButton="outlined" type="button" (click)="openMenu('Clipped menu', $event)">Open clipped menu</button>
    </div>

    <button matButton="outlined" type="button" class="m36-bottom" (click)="openMenu('Bottom menu', $event)">Open bottom menu</button>
  `,
})
export class LabM36Overlay {
  private readonly injector = inject(Injector);
  private readonly refs = new Set<OverlayRef>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.refs.forEach((ref) => ref.dispose()));
  }

  /** A global overlay at the top of the viewport, under the page's sticky header in DOM and z-index terms. */
  protected openNote(): void {
    this.show('Note', createGlobalPositionStrategy(this.injector).top('0px').centerHorizontally(), 'outside');
  }

  /** A global overlay placed by margins; two of them stack, in attach order. */
  protected openStacked(label: string, left: string, dismiss: Dismiss): void {
    this.show(label, createGlobalPositionStrategy(this.injector).top('12rem').left(left), dismiss);
  }

  /** A connected overlay below the clicked button, or above it when below does not fit. */
  protected openMenu(label: string, event: Event): void {
    const origin = event.currentTarget;
    if (!(origin instanceof HTMLElement)) return;
    const strategy = createFlexibleConnectedPositionStrategy(this.injector, origin)
      .withPositions(BELOW_THEN_ABOVE)
      .withFlexibleDimensions(false)
      .withPush(false);
    this.show(label, strategy, 'outside');
  }

  private show(label: string, positionStrategy: PositionStrategy, dismiss: Dismiss): void {
    // 1. createOverlayRef makes the host and the pane; the strategies say where and what scrolling does.
    const ref = createOverlayRef(this.injector, {
      positionStrategy,
      scrollStrategy: createRepositionScrollStrategy(this.injector),
    });
    // 2. A ComponentPortal attaches the panel into the pane.
    ref.attach(new ComponentPortal(LabM36Panel)).setInput('label', label);
    this.refs.add(ref);
    ref.detachments().subscribe(() => this.refs.delete(ref));
    // 3. A raw OverlayRef closes nothing by itself: the page subscribes to the events it cares about.
    if (dismiss === 'outside') ref.outsidePointerEvents().subscribe(() => ref.dispose());
    if (dismiss === 'escape') {
      ref.keydownEvents().subscribe((event) => {
        if (event.key === 'Escape') ref.dispose();
      });
    }
  }
}
