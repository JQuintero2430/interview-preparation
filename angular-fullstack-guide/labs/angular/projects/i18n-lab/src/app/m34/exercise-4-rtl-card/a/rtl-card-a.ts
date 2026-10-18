import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';

// Exercise 34.4, variant a: one stylesheet for both directions. Logical properties and flexbox follow
// `<html dir>`, `<bdi>` isolates the user name, `dir="ltr"` keeps the phone number and the amount in reading
// order, and only the back arrow carries the class that mirrors it under `:dir(rtl)`.
@Component({
  selector: 'lab-m34-ex4-a',
  imports: [CurrencyPipe],
  template: `
    <article class="card" data-testid="card">
      <header class="bar">
        <button
          type="button"
          class="back"
          data-testid="back"
          i18n-aria-label="@@m34.ex4.a.back"
          aria-label="Back"
        >
          <svg
            class="icon mirror-in-rtl"
            data-testid="back-icon"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path d="M10 3 5 8l5 5" />
          </svg>
        </button>
        <h2 i18n="@@m34.ex4.a.title">Account</h2>
        <svg class="icon logo" data-testid="logo" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3 2v12h10" />
        </svg>
      </header>
      <div class="body">
        <span class="avatar" data-testid="avatar" aria-hidden="true">A</span>
        <div class="details">
          <!-- prettier-ignore -->
          <p data-testid="greeting" i18n="@@m34.ex4.a.greeting">Welcome back, <bdi>{{ name }}</bdi></p>
          <dl>
            <dt i18n="@@m34.ex4.a.phone">Phone</dt>
            <dd>
              <span dir="ltr" data-testid="phone">{{ phone }}</span>
            </dd>
            <dt i18n="@@m34.ex4.a.balance">Balance</dt>
            <dd>
              <span dir="ltr" data-testid="amount">{{ balance | currency: 'EUR' }}</span>
            </dd>
          </dl>
        </div>
      </div>
    </article>
  `,
  styles: `
    .card {
      inline-size: 360px;
      border-inline-start: 4px solid #2a6;
      padding-block: 12px;
      padding-inline: 16px 12px;
    }
    .bar {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    h2 {
      margin: 0;
      font-size: 16px;
    }
    .back {
      inline-size: 32px;
      block-size: 32px;
      padding: 0;
    }
    .icon {
      inline-size: 16px;
      block-size: 16px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
    }
    .mirror-in-rtl:dir(rtl) {
      transform: scaleX(-1);
    }
    .logo {
      margin-inline-start: auto;
    }
    .body {
      display: flex;
      gap: 12px;
      margin-block-start: 12px;
    }
    .avatar {
      flex: none;
      inline-size: 40px;
      block-size: 40px;
      border-radius: 50%;
      background: #ddd;
      text-align: center;
      line-height: 40px;
    }
    .details {
      flex: 1;
      text-align: start;
    }
    p,
    dd {
      margin: 0;
    }
    dl {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 4px 12px;
      margin: 8px 0 0;
    }
  `,
})
export class LabM34Ex4A {
  protected readonly name = 'Ana!';
  protected readonly phone = '+57 300 123 4567';
  protected readonly balance = 1234.5;
}
