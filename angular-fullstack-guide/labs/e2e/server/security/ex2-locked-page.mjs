// @ts-check
// Exercise 33.2 (EX-M33-02): the locked comments page's shell with its policy header, and the comments API.
// Node built-ins only.
// - `/m33/ex2/start` (the legacy widget) and `/m33/ex2/a` (solution) on the nonce build: a nonce-based policy with
//   `require-trusted-types-for 'script'; trusted-types angular`; `/m33/ex2/b` (alternative) also allows the widget's
//   own policy, `lab-m33-widget`. N is the response's fresh nonce, which also replaces `__CSP_NONCE__` in the HTML.
// - `/autocsp/m33/ex2/a` (autoCsp build): a header with only `style-src` and the Trusted Types directives.
// - `GET /api/m33/ex2/comments`: one comment whose HTML carries formatting, a script and an `onerror` handler.
// Query flag `inject`: an inline script and an `onerror` handler before the app root (both only count
// `window.__m33Hits`).
import { readFile } from 'node:fs/promises';

const DIST = new URL('../../../angular/dist/', import.meta.url);
const SHELLS = {
  nonce: new URL('security-lab/browser/index.html', DIST),
  autocsp: new URL('security-lab-autocsp/browser/index.html', DIST),
};
const PAGE = /^(\/autocsp)?\/m33\/ex2\/(start|a|b)$/;
const API = '/api/m33/ex2/comments';
const NONCE_PLACEHOLDER = /__CSP_NONCE__/g;
const COUNT = 'window.__m33Hits=(window.__m33Hits||0)+1';
const INJECTED = `<script>${COUNT}</script><img src="/m33-missing.png" alt="" onerror="${COUNT}">`;
const COMMENT = `<p><b>Great</b> post</p><script>${COUNT}</script><img src="data:," alt="" onerror="${COUNT}">`;

/** @param {string} pathname @param {import('../security-server.mjs').RouteContext} ctx */
function policy(pathname, ctx) {
  const [, autocsp, variant] = PAGE.exec(pathname) ?? [];
  const nonce = `'nonce-${ctx.nonce}'`;
  const loading = autocsp
    ? [`style-src 'self' 'unsafe-inline'`]
    : [
        `script-src ${nonce} 'strict-dynamic'`,
        `style-src 'self' ${nonce}`,
        "object-src 'none'",
        "base-uri 'self'",
      ];
  return [
    ...loading,
    `require-trusted-types-for 'script'`,
    `trusted-types angular${variant === 'b' ? ' lab-m33-widget' : ''}`,
    `report-uri /__csp-report?run=${encodeURIComponent(ctx.run)}`,
  ].join('; ');
}

/** @type {import('../security-server.mjs').RouteModule} */
export default {
  name: 'ex2-locked-page',
  match: (url) => url.pathname === API || PAGE.test(url.pathname),
  async handle(_req, res, url, ctx) {
    if (url.pathname === API) {
      return res
        .writeHead(200, { 'content-type': 'application/json' })
        .end(JSON.stringify({ html: COMMENT }));
    }
    const autocsp = url.pathname.startsWith('/autocsp/');
    let html = await readFile(autocsp ? SHELLS.autocsp : SHELLS.nonce, 'utf8');
    if (url.searchParams.has('inject')) html = html.replace('<lab-root', `${INJECTED}<lab-root`);
    res
      .writeHead(200, {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'content-security-policy': policy(url.pathname, ctx),
      })
      .end(html.replace(NONCE_PLACEHOLDER, ctx.nonce));
  },
};
