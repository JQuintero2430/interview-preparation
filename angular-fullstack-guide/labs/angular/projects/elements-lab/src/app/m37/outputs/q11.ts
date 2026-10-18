import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

interface ApiBody {
  readonly name: string;
  readonly hit: number;
}

type Endpoint = 'catalog' | 'prices' | 'uncached';

const ENDPOINTS: readonly Endpoint[] = ['catalog', 'prices', 'uncached'];

/** Q37.11: one button loads the three endpoints and shows, per endpoint, the server's hit number or "failed". */
@Component({
  selector: 'lab-m37-q11',
  template: `
    <h2>Offline outputs lab</h2>
    <button type="button" (click)="loadAll()">Load all three</button>
    <p data-testid="catalog-result">{{ results().catalog }}</p>
    <p data-testid="prices-result">{{ results().prices }}</p>
    <p data-testid="uncached-result">{{ results().uncached }}</p>
  `,
})
export class LabM37Q11 {
  private readonly http = inject(HttpClient);
  protected readonly results = signal<Record<Endpoint, string>>({ catalog: 'not loaded', prices: 'not loaded', uncached: 'not loaded' });

  protected async loadAll(): Promise<void> {
    await Promise.all(ENDPOINTS.map((endpoint) => this.load(endpoint)));
  }

  private async load(endpoint: Endpoint): Promise<void> {
    let text: string;
    try {
      const body = await firstValueFrom(this.http.get<ApiBody>(`/api/m37/${endpoint}`));
      text = `${body.name} hit ${body.hit}`;
    } catch {
      text = `${endpoint} failed`;
    }
    this.results.update((current) => ({ ...current, [endpoint]: text }));
  }
}
