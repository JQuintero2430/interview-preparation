import { Component, Injector, TemplateRef, ViewContainerRef, inject, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createOverlayRef } from '@angular/cdk/overlay';
import { CdkPortalOutlet, TemplatePortal } from '@angular/cdk/portal';

interface Greeting {
  readonly $implicit: string;
}

/** The template is declared in the source section and rendered, through a portal, in the target section. */
@Component({
  selector: 'lab-m36-portal-host',
  imports: [CdkPortalOutlet],
  template: `
    <section class="m36-portal-source">
      <ng-template #card let-name><p class="m36-portal-card">Hello {{ name }}</p></ng-template>
    </section>
    <section class="m36-portal-target"><ng-template [cdkPortalOutlet]="portal()"></ng-template></section>
  `,
})
class LabM36PortalHost {
  private readonly card = viewChild.required<TemplateRef<Greeting>>('card');
  private readonly viewContainerRef = inject(ViewContainerRef);
  protected readonly portal = signal<TemplatePortal<Greeting> | null>(null);

  show(name: string): void {
    this.portal.set(new TemplatePortal(this.card(), this.viewContainerRef, { $implicit: name }));
  }
}

describe('Section 5: portals and overlays', () => {
  it('Section 5: a TemplatePortal renders its template into a CdkPortalOutlet with its context', async () => {
    const fixture = TestBed.createComponent(LabM36PortalHost);
    fixture.detectChanges();
    fixture.componentInstance.show('Ada');
    fixture.detectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;

    // Declared in the source section, rendered in the target section, with the context's $implicit value.
    expect(root.querySelector('.m36-portal-source .m36-portal-card')).toBeNull();
    expect(root.querySelectorAll('.m36-portal-card').length).toBe(1);
    expect(root.querySelector('.m36-portal-target .m36-portal-card')?.textContent).toBe('Hello Ada');
  });

  it('Section 5: without popover support the host goes into the overlay container', () => {
    // jsdom has no showPopover, so createOverlayRef turns usePopover off and keeps the host in the overlay container.
    expect('showPopover' in document.body).toBe(false);
    const ref = createOverlayRef(TestBed.inject(Injector));
    const host = ref.hostElement;

    expect(ref.getConfig().usePopover).toBe(false);
    expect(host.hasAttribute('popover')).toBe(false);
    expect(host.classList.contains('cdk-overlay-popover')).toBe(false);
    expect(host.parentElement?.classList.contains('cdk-overlay-container')).toBe(true);
    expect(host.parentElement?.parentElement).toBe(document.body);
    ref.dispose();
  });
});
