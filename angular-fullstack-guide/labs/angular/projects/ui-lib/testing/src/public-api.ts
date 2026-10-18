/** Test helper in its own entry point (`ui-lib/testing`); needs no `@angular/core/testing` import. */
export class UiBadgeHarnessLite {
  constructor(private readonly root: HTMLElement) {}

  text(): string {
    return this.root.querySelector('ui-badge .ui-badge')?.textContent?.trim() ?? '';
  }
}
