import { Injectable, SecurityContext, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/** The policy name the alternative's header must allow next to `angular`. */
export const LAB_M33_WIDGET_POLICY = 'lab-m33-widget';

/** The part of a Trusted Types policy the widget uses (TypeScript 6.0.3's `lib.dom` has no Trusted Types types). */
interface HtmlPolicy {
  createHTML(input: string): unknown;
}

interface PolicyFactory {
  createPolicy(name: string, rules: { createHTML(input: string): string }): HtmlPolicy;
}

function isPolicyFactory(value: unknown): value is PolicyFactory {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof Reflect.get(value, 'createPolicy') === 'function'
  );
}

/**
 * Exercise 33.2, the alternative: a widget that must keep writing HTML gets a policy of its own, and the policy
 * sanitizes with Angular's HTML sanitizer before it returns. Provided by the route.
 */
@Injectable()
export class LabM33Ex2WidgetPolicy {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly policy = this.createPolicy();

  write(element: HTMLElement, html: string): void {
    const value = this.policy ? this.policy.createHTML(html) : this.sanitize(html);
    // `lib.dom` types `innerHTML` as a string; the browser accepts the `TrustedHTML` the policy made.
    Reflect.set(element, 'innerHTML', value);
  }

  private sanitize(html: string): string {
    return this.sanitizer.sanitize(SecurityContext.HTML, html) ?? '';
  }

  private createPolicy(): HtmlPolicy | null {
    const factory: unknown = Reflect.get(globalThis, 'trustedTypes');
    if (!isPolicyFactory(factory)) return null; // no Trusted Types in this browser: sanitize and write a string
    return factory.createPolicy(LAB_M33_WIDGET_POLICY, {
      createHTML: (html) => this.sanitize(html),
    });
  }
}
