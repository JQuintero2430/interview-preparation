// A fake non-React "chart library": imperative, owns the DOM inside its container,
// and must be destroyed explicitly. Every call is recorded so tests can assert the sequence.
export const widgetLog: string[] = [];

export class ChartWidget {
  #container: HTMLElement;

  constructor(container: HTMLElement) {
    this.#container = container;
    widgetLog.push('create');
  }

  update(data: readonly number[]) {
    this.#container.textContent = `Chart: ${data.join(', ')}`;
    widgetLog.push(`update ${data.join(',')}`);
  }

  destroy() {
    this.#container.textContent = '';
    widgetLog.push('destroy');
  }
}
