import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, LOCALE_ID, signal } from '@angular/core';

// One message per plural category: translators see six, and the code picks one with `Intl.PluralRules`.
const SUMMARIES: Record<Intl.LDMLPluralRule, (count: number) => string> = {
  zero: () => $localize`:@@m34.ex2.b.zero:No items`,
  one: (count) => $localize`:@@m34.ex2.b.one:${count}:count: item`,
  two: (count) => $localize`:@@m34.ex2.b.two:${count}:count: items`,
  few: (count) => $localize`:@@m34.ex2.b.few:${count}:count: items`,
  many: (count) => $localize`:@@m34.ex2.b.many:${count}:count: items`,
  other: (count) => $localize`:@@m34.ex2.b.other:${count}:count: items`,
};

// Exercise 34.2, variant b: the same summary as variant a, with the plural choice moved into code.
@Component({
  selector: 'lab-m34-ex2-b',
  imports: [CurrencyPipe],
  template: `
    <h2 i18n="@@m34.ex2.b.heading">Order summary</h2>
    <div role="group">
      @for (n of counts; track n) {
        <button type="button" (click)="count.set(n)">{{ n }}</button>
      }
    </div>
    <p data-testid="summary">{{ summary() }}</p>
    <p>
      <span i18n="@@m34.ex2.b.total">Total</span>:
      <strong data-testid="total">{{ count() * unitPrice | currency: 'EUR' }}</strong>
    </p>
  `,
})
export class LabM34Ex2B {
  protected readonly counts = [0, 1, 2, 3, 11];
  protected readonly count = signal(3);
  protected readonly unitPrice = 12.5;
  private readonly rules = new Intl.PluralRules(inject(LOCALE_ID));
  protected readonly summary = computed(() =>
    SUMMARIES[this.rules.select(this.count())](this.count()),
  );
}
