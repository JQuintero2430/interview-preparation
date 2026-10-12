import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RenderMeter {
  private readonly names = new Set<string>();

  hit(name: string): void {
    this.names.add(name);
  }

  ranSince(): readonly string[] {
    return [...this.names].sort();
  }

  reset(): void {
    this.names.clear();
  }
}
