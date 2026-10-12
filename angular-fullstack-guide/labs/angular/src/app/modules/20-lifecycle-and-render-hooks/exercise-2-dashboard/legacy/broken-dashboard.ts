// Legacy: three dashboards written the pre-signal way, each with one bug. Exercise 20.2 starts here; this file stays unchanged.
import { ChangeDetectionStrategy, Component, DoCheck, OnInit, inject } from '@angular/core';

@Component({ selector: 'lab-m20-broken-title-slot', template: `slot` })
export class BrokenTitleSlot implements OnInit {
  private readonly dashboard = inject(BrokenTitleDashboard);

  ngOnInit(): void {
    this.dashboard.title = 'Sales';
  }
}

// Bug 1: a child writes a plain field that the parent's template has already read.
@Component({
  selector: 'lab-m20-broken-title-dashboard',
  imports: [BrokenTitleSlot],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<h2>{{ title }}</h2>
    <lab-m20-broken-title-slot />`,
})
export class BrokenTitleDashboard {
  title = 'Untitled';
}

// Bug 2: a template method that counts its own calls.
@Component({
  selector: 'lab-m20-broken-total-dashboard',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<p>{{ total() }}</p>`,
})
export class BrokenTotalDashboard {
  items = [10, 20];
  private calls = 0;

  total(): string {
    this.calls += 1;
    return `Total ${this.items.reduce((sum, price) => sum + price, 0)} (read ${this.calls})`;
  }
}

// Bug 3: ngDoCheck is meant to notice an in-place edit, and nothing makes it run.
@Component({
  selector: 'lab-m20-broken-list-dashboard',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<p>{{ count }} items</p>`,
})
export class BrokenListDashboard implements DoCheck {
  items = [10, 20];
  count = 0;

  add(): void {
    this.items.push(5);
  }

  ngDoCheck(): void {
    this.count = this.items.length;
  }
}
