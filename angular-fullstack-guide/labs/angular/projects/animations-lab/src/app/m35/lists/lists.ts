import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
} from '@angular/core';

/** Media query a script animation checks itself: CSS rules cannot switch off element.animate(). */
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Every row the keyed list can show, in its natural order. */
const CATALOG: readonly string[] = ['A', 'B', 'C', 'D'];

// Section 7: animating lists. One @for per behavior: a keyed list (track by id), an index list (track $index)
// and a staggered list. Angular decides which rows enter, leave or only move; the browser runs the animations.
@Component({
  selector: 'lab-m35-lists',
  template: `
    <h1>Section 7: animating lists</h1>

    <h2>Keyed list (track row)</h2>
    <button type="button" (click)="toggle('B')">Toggle row B</button>
    <button type="button" (click)="toggle('D')">Toggle row D</button>
    <button type="button" (click)="reorder()">Reverse order</button>
    <label
      ><input type="checkbox" [checked]="glide()" (change)="glide.set(!glide())" /> Glide on
      reorder</label
    >
    <ul data-testid="keyed-list">
      @for (row of rows(); track row) {
        <li
          class="m35-row"
          animate.enter="m35-row-in"
          animate.leave="m35-row-out"
          [attr.data-row]="row"
          [attr.data-testid]="'row-' + row"
        >
          Row {{ row }}
        </li>
      }
    </ul>

    <h2>Index list (track $index)</h2>
    <button type="button" (click)="reverseIndexItems()">Reverse index list</button>
    <button type="button" (click)="removeFirstIndexItem()">Remove first indexed item</button>
    <ul data-testid="index-list">
      @for (item of indexItems(); track $index) {
        <li
          class="m35-row"
          animate.enter="m35-row-in"
          animate.leave="m35-row-out"
          [attr.data-testid]="'index-row-' + $index"
        >
          {{ item }}
        </li>
      }
    </ul>

    <h2>Staggered list</h2>
    <button type="button" (click)="staggerShown.set(!staggerShown())">Toggle staggered list</button>
    @if (staggerShown()) {
      <ul data-testid="stagger-list">
        @for (item of staggerItems; track item) {
          <li
            class="m35-row"
            animate.enter="m35-stagger-in"
            [style.--i]="$index"
            [attr.data-testid]="'stagger-row-' + $index"
          >
            {{ item }}
          </li>
        }
      </ul>
    }
  `,
  styles: `
    ul {
      width: 12rem;
      padding: 0;
      list-style: none;
    }

    .m35-row {
      padding: 0.5rem 1rem;
      margin-block: 0.25rem;
      background: #dbeafe;
    }

    .m35-row-in {
      animation: m35-row-slide-in 1500ms;
    }

    .m35-row-out {
      animation: m35-row-slide-out 1500ms forwards;
    }

    /* The stagger: each row's delay is its index times 40 ms, read from the custom property the template sets. */
    .m35-stagger-in {
      animation: m35-row-slide-in 1500ms backwards;
      animation-delay: calc(var(--i) * 40ms);
    }

    @keyframes m35-row-slide-in {
      from {
        opacity: 0;
        transform: translateX(-2rem);
      }
    }

    @keyframes m35-row-slide-out {
      to {
        opacity: 0;
        transform: translateX(2rem);
      }
    }
  `,
})
export class LabM35Lists {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected readonly present = signal<ReadonlySet<string>>(new Set(['A', 'B', 'C']));
  protected readonly reversed = signal(false);
  protected readonly glide = signal(false);
  protected readonly rows = computed(() => {
    const visible = CATALOG.filter((row) => this.present().has(row));
    return this.reversed() ? visible.reverse() : visible;
  });

  protected readonly indexItems = signal(['A', 'B', 'C']);
  protected readonly staggerItems = ['One', 'Two', 'Three', 'Four'];
  protected readonly staggerShown = signal(false);

  protected toggle(row: string): void {
    this.present.update((current) => {
      const next = new Set(current);
      if (!next.delete(row)) next.add(row);
      return next;
    });
  }

  protected reverseIndexItems(): void {
    this.indexItems.update((items) => [...items].reverse());
  }

  protected removeFirstIndexItem(): void {
    this.indexItems.update((items) => items.slice(1));
  }

  // The FLIP pattern (First, Last, Invert, Play), written by hand: it is not an Angular feature.
  // The reorder button reads each row's box before the change and plays a transform animation after it.
  protected reorder(): void {
    const first = this.rowTops();
    this.reversed.set(!this.reversed());
    if (!this.glide() || matchMedia(REDUCED_MOTION_QUERY).matches) return;
    afterNextRender(
      () => {
        for (const row of this.host.nativeElement.querySelectorAll<HTMLElement>('[data-row]')) {
          const offset =
            (first.get(row.dataset['row'] ?? '') ?? 0) - row.getBoundingClientRect().top;
          if (offset !== 0) {
            row.animate([{ transform: `translateY(${offset}px)` }, { transform: 'none' }], {
              duration: 1500,
            });
          }
        }
      },
      { injector: this.injector },
    );
  }

  private rowTops(): Map<string, number> {
    const tops = new Map<string, number>();
    for (const row of this.host.nativeElement.querySelectorAll<HTMLElement>('[data-row]')) {
      tops.set(row.dataset['row'] ?? '', row.getBoundingClientRect().top);
    }
    return tops;
  }
}
