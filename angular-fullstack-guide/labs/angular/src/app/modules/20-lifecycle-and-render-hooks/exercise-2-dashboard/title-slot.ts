import { Component, Injectable, OnInit, inject, input, signal } from '@angular/core';

@Injectable()
export class DashboardTitle {
  readonly text = signal('Untitled');
}

@Component({ selector: 'lab-m20-title-slot', template: `{{ items().length }} items` })
export class TitleSlot implements OnInit {
  readonly label = input.required<string>();
  readonly items = input.required<readonly number[]>();
  private readonly title = inject(DashboardTitle);

  ngOnInit(): void {
    this.title.text.set(this.label());
  }
}
