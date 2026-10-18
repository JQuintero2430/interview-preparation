import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';

// Exercise 34.4, variant b: the starting card's physical properties stay, and a second rule for each of them
// applies under `[dir=rtl]`. `:host-context()` is needed because emulated encapsulation scopes every compound
// selector to the component, and `<html>` is outside it. The markup isolates text exactly as variant a does.
@Component({
  selector: 'lab-m34-ex4-b',
  imports: [CurrencyPipe],
  template: `
    <article class="card" data-testid="card">
      <header class="bar">
        <button
          type="button"
          class="back"
          data-testid="back"
          i18n-aria-label="@@m34.ex4.b.back"
          aria-label="Back"
        >
          <svg
            class="icon back-icon"
            data-testid="back-icon"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path d="M10 3 5 8l5 5" />
          </svg>
        </button>
        <h2 i18n="@@m34.ex4.b.title">Account</h2>
        <svg class="icon logo" data-testid="logo" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3 2v12h10" />
        </svg>
      </header>
      <div class="body">
        <span class="avatar" data-testid="avatar" aria-hidden="true">A</span>
        <div class="details">
          <!-- prettier-ignore -->
          <p data-testid="greeting" i18n="@@m34.ex4.b.greeting">Welcome back, <bdi>{{ name }}</bdi></p>
          <dl>
            <dt i18n="@@m34.ex4.b.phone">Phone</dt>
            <dd>
              <span dir="ltr" data-testid="phone">{{ phone }}</span>
            </dd>
            <dt i18n="@@m34.ex4.b.balance">Balance</dt>
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
      width: 360px;
      border-left: 4px solid #2a6;
      padding: 12px 12px 12px 16px;
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
      width: 32px;
      height: 32px;
      padding: 0;
    }
    .icon {
      width: 16px;
      height: 16px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
    }
    .logo {
      margin-left: auto;
    }
    .body {
      margin-top: 12px;
    }
    .avatar {
      float: left;
      margin-right: 12px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #ddd;
      text-align: center;
      line-height: 40px;
    }
    .details {
      overflow: hidden;
      text-align: left;
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
    :host-context([dir='rtl']) .card {
      border-left: 0;
      border-right: 4px solid #2a6;
      padding: 12px 16px 12px 12px;
    }
    :host-context([dir='rtl']) .back-icon {
      transform: scaleX(-1);
    }
    :host-context([dir='rtl']) .logo {
      margin-left: 0;
      margin-right: auto;
    }
    :host-context([dir='rtl']) .avatar {
      float: right;
      margin-right: 0;
      margin-left: 12px;
    }
    :host-context([dir='rtl']) .details {
      text-align: right;
    }
  `,
})
export class LabM34Ex4B {
  protected readonly name = 'Ana!';
  protected readonly phone = '+57 300 123 4567';
  protected readonly balance = 1234.5;
}
