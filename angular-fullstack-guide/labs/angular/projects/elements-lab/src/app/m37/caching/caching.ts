import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

interface ApiBody {
  readonly name: string;
  readonly hit: number;
}

type Endpoint = 'catalog' | 'prices' | 'uncached';

/** Calls the three `/api/m37/*` endpoints and shows what came back, so tests can tell the server's answer from a cached one. */
@Component({
  selector: 'lab-m37-caching',
  template: `
    <h2>Caching lab</h2>
    <button type="button" (click)="load('catalog')">Load catalog</button>
    <button type="button" (click)="load('prices')">Load prices</button>
    <button type="button" (click)="load('uncached')">Load uncached</button>
    <button type="button" (click)="load('catalog', true)">Load catalog with bypass</button>
    <p data-testid="catalog-result">{{ results().catalog }}</p>
    <p data-testid="prices-result">{{ results().prices }}</p>
    <p data-testid="uncached-result">{{ results().uncached }}</p>
  `,
})
export class LabM37Caching {
  private readonly http = inject(HttpClient);
  protected readonly results = signal<Record<Endpoint, string>>({ catalog: 'not loaded', prices: 'not loaded', uncached: 'not loaded' });

  protected async load(endpoint: Endpoint, bypass = false): Promise<void> {
    const headers = bypass ? { 'ngsw-bypass': 'true' } : undefined;
    let text: string;
    try {
      const body = await firstValueFrom(this.http.get<ApiBody>(`/api/m37/${endpoint}`, { headers }));
      text = `${body.name} hit ${body.hit}`;
    } catch {
      text = `${endpoint} failed`;
    }
    this.results.update((current) => ({ ...current, [endpoint]: text }));
  }
}
