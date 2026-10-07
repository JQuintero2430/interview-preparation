// Exercise 08.3: a framework-independent rating widget built on a custom element and an open shadow root.

const DEFAULT_MAX = 5;

/** Limits `value` to the whole numbers 0…max. */
const clamp = (value: number, max: number) => Math.min(max, Math.max(0, Math.round(value) || 0));

/** `<rating-stars value="3" max="5">`: renders `max` star buttons and dispatches `rating-change` when one is clicked. */
export class RatingStars extends HTMLElement {
  static observedAttributes = ['value', 'max'];
  readonly #root = this.attachShadow({ mode: 'open' });
  #listeners: AbortController | null = null;

  /** The number of stars; a missing or invalid `max` attribute means 5. */
  get max(): number {
    const max = Number(this.getAttribute('max'));
    return Number.isInteger(max) && max > 0 ? max : DEFAULT_MAX;
  }

  /** The current rating, clamped to 0…max; setting it reflects to the `value` attribute. */
  get value(): number {
    return clamp(Number(this.getAttribute('value')), this.max);
  }

  set value(value: number) {
    this.setAttribute('value', String(clamp(value, this.max)));
  }

  connectedCallback() {
    this.#listeners = new AbortController();
    // One delegated listener on the shadow root survives every re-render of the buttons.
    this.#root.addEventListener('click', (event) => this.#select(event), { signal: this.#listeners.signal });
    this.#render();
  }

  disconnectedCallback() {
    this.#listeners?.abort();
  }

  attributeChangedCallback() {
    this.#render();
  }

  #select(event: Event) {
    const star = (event.target as Element).closest<HTMLButtonElement>('button[data-value]');
    if (!star) return;
    this.value = Number(star.dataset['value']);
    this.dispatchEvent(new CustomEvent('rating-change', { detail: { value: this.value }, bubbles: true, composed: true }));
  }

  #render() {
    const stars = Array.from({ length: this.max }, (_, i) => i + 1);
    this.#root.innerHTML = stars
      .map((n) => `<button part="star" data-value="${n}" aria-label="${n} of ${this.max}" aria-pressed="${n <= this.value}">★</button>`)
      .join('');
  }
}

if (!customElements.get('rating-stars')) customElements.define('rating-stars', RatingStars);
