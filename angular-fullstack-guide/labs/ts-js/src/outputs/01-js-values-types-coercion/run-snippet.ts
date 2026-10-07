// labs/ts-js/src/outputs/01-js-values-types-coercion/run-snippet.ts
// Most Module 01 puzzles are code that TypeScript rejects on purpose (`[] + {}`, `null >= 0`,
// `typeof notDeclared`…). To test the exact JavaScript printed in the module, each test keeps the
// snippet as source text and runs it with `new Function`, with `console.log` routed to the
// `captureLogs` logger. Like any classic script, the body is sloppy-mode code unless the snippet
// itself starts with 'use strict'.

/** The `log` function handed out by `captureLogs`. */
export type Log = (...args: unknown[]) => void;

type SnippetBody = (console: { log: Log }) => void;

/**
 * Runs JavaScript source text with `console.log` redirected to `log`.
 * @param source the snippet exactly as shown in the module
 * @param log the logger provided by `captureLogs`
 */
export function runSnippet(source: string, log: Log): void {
  const body = new Function('console', source) as SnippetBody;
  body({ log });
}
