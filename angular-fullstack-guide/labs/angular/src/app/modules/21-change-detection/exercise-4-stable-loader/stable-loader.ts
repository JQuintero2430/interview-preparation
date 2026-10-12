import { Component, DestroyRef, inject, input, OnInit, PendingTasks, signal } from '@angular/core';
import { SlowSource } from './slow-source';

@Component({
  selector: 'lab-m21-e4-loader',
  template: `@if (error()) {
    <p class="error">{{ error() }}</p>
  } @else {
    <p class="text">{{ text() }}</p>
  }`,
})
export class StableLoader implements OnInit {
  readonly key = input.required<string>();
  readonly text = signal('loading');
  readonly error = signal('');

  private readonly source = inject(SlowSource);
  private readonly tasks = inject(PendingTasks);
  private release: () => void = () => undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.release());
  }

  async ngOnInit(): Promise<void> {
    this.release = this.tasks.add();
    try {
      this.text.set(await this.source.load(this.key()));
    } catch (reason) {
      this.error.set(reason instanceof Error ? reason.message : 'failed');
    } finally {
      this.release();
    }
  }
}
