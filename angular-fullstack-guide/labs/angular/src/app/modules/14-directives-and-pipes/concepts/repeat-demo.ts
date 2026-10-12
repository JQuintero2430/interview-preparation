import { Component, Directive, effect, inject, input, signal, TemplateRef, untracked, ViewContainerRef } from '@angular/core';

// The context every embedded view of `Each` receives: `let item` reads `$implicit`.
export interface EachContext<T> {
  readonly $implicit: T;
  readonly index: number;
}

// A structural directive that stamps its template once per item: `*labEach="let item of items; let i = index"`.
@Directive({ selector: '[labEach]' })
export class Each<T> {
  readonly labEachOf = input.required<readonly T[]>();
  private readonly template = inject<TemplateRef<EachContext<T>>>(TemplateRef);
  private readonly container = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      const items = this.labEachOf();
      untracked(() => {
        this.container.clear();
        items.forEach((item, index) => this.container.createEmbeddedView(this.template, { $implicit: item, index }));
      });
    });
  }

  // Compile-time only: it types `let item` as T instead of any. The body never runs.
  static ngTemplateContextGuard<T>(_directive: Each<T>, _context: unknown): _context is EachContext<T> {
    return true;
  }
}

// A structural directive that renders its template while the bound value is truthy.
@Directive({ selector: '[labShow]' })
export class Show {
  readonly labShow = input.required<unknown>();
  private readonly template = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly container = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      const visible = this.labShow();
      untracked(() => {
        this.container.clear();
        if (visible) {
          this.container.createEmbeddedView(this.template);
        }
      });
    });
  }

  // Compile-time only: inside the template the bound expression counts as truthy.
  static ngTemplateGuard_labShow: 'binding';
}

@Component({
  selector: 'lab-repeat-demo',
  imports: [Each, Show],
  template: `
    <ul>
      <li *labEach="let name of names(); let i = index">{{ i }}:{{ name.toUpperCase() }}</li>
    </ul>
    <p *labShow="nickname">{{ nickname.length }}</p>
  `,
})
export class RepeatDemo {
  readonly names = signal(['ada', 'grace']);
  // A plain field: narrowing follows a property read, not a call such as `nickname()`.
  readonly nickname: string | null = 'ace';
}
