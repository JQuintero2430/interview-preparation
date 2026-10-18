import { Component, DestroyRef, Injector, inject, input } from '@angular/core';
import {
  type ConnectedPosition,
  type OverlayRef,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { MatButton } from '@angular/material/button';

/** The first position that fits the viewport wins; each one tags the pane with a class the test reads. */
const BELOW_THEN_ABOVE: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', panelClass: 'm36-out-below' },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', panelClass: 'm36-out-above' },
];

/** The content of the overlay, attached through a ComponentPortal. */
@Component({
  selector: 'lab-m36-q10-panel',
  host: { class: 'm36-out-panel', role: 'group', '[attr.aria-label]': 'label()' },
  template: `
    <p>{{ label() }}</p>
    <button type="button">Inside</button>
  `,
})
class LabM36Q10Panel {
  readonly label = input.required<string>();
}

/** A connected overlay below its button, or above it when below does not fit; Escape and an outside click close it. */
@Component({
  selector: 'lab-m36-q10',
  imports: [MatButton],
  host: { class: 'm36-out-page' },
  template: `
    <h1>Q36.10: an overlay near the bottom edge</h1>
    <button matButton="outlined" type="button" (click)="open('Top menu', $event)">Open top menu</button>
    <button matButton="outlined" type="button" class="m36-out-bottom" (click)="open('Bottom menu', $event)">Open bottom menu</button>
  `,
})
export class LabM36Q10 {
  private readonly injector = inject(Injector);
  private readonly refs = new Set<OverlayRef>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.refs.forEach((ref) => ref.dispose()));
  }

  protected open(label: string, event: Event): void {
    const origin = event.currentTarget;
    if (!(origin instanceof HTMLElement)) return;
    // 1. The flexible strategy tries the positions in order and keeps the first that fits.
    const positionStrategy = createFlexibleConnectedPositionStrategy(this.injector, origin)
      .withPositions(BELOW_THEN_ABOVE)
      .withFlexibleDimensions(false)
      .withPush(false);
    // 2. createOverlayRef makes the host and the pane; a ComponentPortal attaches the panel into the pane.
    const ref = createOverlayRef(this.injector, {
      positionStrategy,
      scrollStrategy: createRepositionScrollStrategy(this.injector),
    });
    ref.attach(new ComponentPortal(LabM36Q10Panel)).setInput('label', label);
    this.refs.add(ref);
    ref.detachments().subscribe(() => this.refs.delete(ref));
    // 3. A raw OverlayRef closes nothing by itself: the page subscribes to Escape and to pointer events outside.
    ref.outsidePointerEvents().subscribe(() => ref.dispose());
    ref.keydownEvents().subscribe((keyEvent) => {
      if (keyEvent.key === 'Escape') ref.dispose();
    });
  }
}
