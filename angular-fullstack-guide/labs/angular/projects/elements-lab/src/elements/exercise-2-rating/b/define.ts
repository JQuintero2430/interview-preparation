import { ApplicationRef, ComponentRef, EnvironmentInjector, Injector, createComponent } from '@angular/core';
import { LabRating } from '../rating';

type RatingInput = 'maxStars' | 'value';

const ATTRIBUTE_TO_INPUT: Readonly<Record<string, RatingInput>> = { 'max-stars': 'maxStars', value: 'value' };

/** Variant b: a hand-written custom element over `createComponent`. */
export function defineRatingB(injector: Injector): void {
  if (customElements.get('m37-ex2-rating-b')) return;
  const environmentInjector = injector.get(EnvironmentInjector);
  const appRef = injector.get(ApplicationRef);

  class LabRatingB extends HTMLElement {
    static readonly observedAttributes = Object.keys(ATTRIBUTE_TO_INPUT);

    #ref: ComponentRef<LabRating> | null = null;
    /** Values set before the component exists (attributes on upgrade, properties set early). */
    readonly #pending = new Map<RatingInput, unknown>();

    get maxStars(): unknown {
      return this.#ref ? this.#ref.instance.maxStars() : this.#pending.get('maxStars');
    }
    set maxStars(v: unknown) {
      this.#setInput('maxStars', v);
    }
    get value(): unknown {
      return this.#ref ? this.#ref.instance.value() : this.#pending.get('value');
    }
    set value(v: unknown) {
      this.#setInput('value', v);
    }

    /** Attribute strings go to the input as they are; the input's `numberAttribute` transform converts them. */
    attributeChangedCallback(name: string, _old: string | null, newValue: string | null): void {
      const input = ATTRIBUTE_TO_INPUT[name];
      if (input) this.#setInput(input, newValue);
    }

    connectedCallback(): void {
      if (this.#ref) return; // re-connected before the scheduled destroy ran: keep the same component
      const ref = createComponent(LabRating, { environmentInjector, hostElement: this });
      this.#ref = ref;
      for (const [name, v] of this.#pending) ref.setInput(name, v);
      ref.instance.ratingChange.subscribe((detail) => this.dispatchEvent(new CustomEvent('ratingChange', { detail })));
      appRef.attachView(ref.hostView);
      ref.changeDetectorRef.detectChanges();
    }

    disconnectedCallback(): void {
      queueMicrotask(() => {
        if (this.isConnected) return;
        this.#ref?.destroy();
        this.#ref = null;
      });
    }

    #setInput(name: RatingInput, v: unknown): void {
      this.#pending.set(name, v);
      this.#ref?.setInput(name, v);
    }
  }

  customElements.define('m37-ex2-rating-b', LabRatingB);
}
