import { expect, type Locator, type Page } from '@playwright/test';

/** Page object for the fixture todos page: every locator is by role or label, and only this file knows them. */
export class TodosPage {
  readonly validation: Locator;
  private readonly heading: Locator;
  private readonly loading: Locator;
  private readonly checkboxes: Locator;

  constructor(private readonly page: Page) {
    this.validation = page.getByRole('alert');
    this.heading = page.getByRole('heading', { name: 'Todos' });
    this.loading = page.getByRole('status').filter({ hasText: 'Loading…' });
    this.checkboxes = page.getByRole('checkbox');
  }

  async goto(q?: string): Promise<void> {
    await this.page.goto(q === undefined ? '/m30/todos' : `/m30/todos?q=${encodeURIComponent(q)}`);
  }

  async add(title: string): Promise<void> {
    await this.page.getByLabel('New todo').fill(title);
    await this.page.getByRole('button', { name: 'Add' }).click();
  }

  async submitEmpty(): Promise<void> {
    await this.add('');
  }

  row(title: string): Locator {
    return this.page.getByRole('listitem').filter({ hasText: title });
  }

  async deleteRow(title: string): Promise<void> {
    await this.row(title).getByRole('button', { name: 'Delete' }).click();
  }

  /** The titles on screen once the first load has finished. */
  async titles(): Promise<string[]> {
    await expect(this.heading).toBeVisible();
    await expect(this.loading).toHaveCount(0);
    return this.checkboxes.evaluateAll((boxes) =>
      boxes.map((box) => (box instanceof HTMLInputElement ? (box.labels?.[0]?.textContent ?? '').trim() : '')),
    );
  }
}
