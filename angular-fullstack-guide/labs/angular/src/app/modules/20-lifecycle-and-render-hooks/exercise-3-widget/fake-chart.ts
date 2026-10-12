import { Injectable } from '@angular/core';

/** A stand-in for a third-party chart: plain class, no Angular, counts what it is asked to do. */
export class FakeChart {
  readonly calls = { update: 0, resize: 0, destroy: 0 };
  width = 0;

  constructor(
    readonly host: HTMLElement,
    public data: readonly number[],
  ) {}

  update(data: readonly number[]): void {
    this.calls.update++;
    this.data = data;
  }

  resize(width: number): void {
    this.calls.resize++;
    this.width = width;
  }

  destroy(): void {
    this.calls.destroy++;
  }
}

/** What the spec reads: every chart that was created and the order of the render-hook phases. */
@Injectable({ providedIn: 'root' })
export class ChartLog {
  readonly charts: FakeChart[] = [];
  readonly entries: string[] = [];
}
