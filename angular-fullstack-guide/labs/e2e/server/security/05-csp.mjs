// @ts-check
// Section 5 (SEC-M33-05): the CSP page's shell with a Content Security Policy header. Node built-ins only.
// - `/m33/csp` (nonce build): `script-src 'nonce-N' 'strict-dynamic'; style-src 'self' 'nonce-N'; …` with N the
//   response's fresh nonce, which also replaces `__CSP_NONCE__` in the HTML (root element and script tags).
// - `/autocsp/m33/csp` (autoCsp build): the header carries only `style-src`; the build's meta tag covers scripts.
// Query flags: `inject` adds an inline script and an `onerror` handler before the app root (both only count
// `window.__m33Hits`); `mismatch` gives the root element's `ngCspNonce` another nonce than the header;
// `report-only` sends the policy as `Content-Security-Policy-Report-Only`.
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const DIST = new URL('../../../angular/dist/', import.meta.url);
const SHELLS = {
  nonce: new URL('security-lab/browser/index.html', DIST),
  autocsp: new URL('security-lab-autocsp/browser/index.html', DIST),
};
const NONCE_PLACEHOLDER = /__CSP_NONCE__/g;
const ROOT_NONCE = 'ngcspnonce="__CSP_NONCE__"';
const COUNT = 'window.__m33Hits=(window.__m33Hits||0)+1';
const INJECTED = `<script>${COUNT}</script><img src="/m33-missing.png" alt="" onerror="${COUNT}">`;
const AUTOCSP_POLICY = "style-src 'self' 'unsafe-inline'";

/** @param {import('../security-server.mjs').RouteContext} ctx */
function noncePolicy(ctx) {
  const nonce = `'nonce-${ctx.nonce}'`;
  return [
    `script-src ${nonce} 'strict-dynamic'`,
    `style-src 'self' ${nonce}`,
    "object-src 'none'",
    "base-uri 'self'",
    `report-uri /__csp-report?run=${encodeURIComponent(ctx.run)}`,
  ].join('; ');
}

/** @param {URL} url @param {boolean} autocsp @param {string} nonce */
async function shell(url, autocsp, nonce) {
  let html = await readFile(autocsp ? SHELLS.autocsp : SHELLS.nonce, 'utf8');
  if (url.searchParams.has('inject')) html = html.replace('<lab-root', `${INJECTED}<lab-root`);
  const rootNonce = url.searchParams.has('mismatch') ? randomBytes(16).toString('base64') : nonce;
  return html.replace(ROOT_NONCE, `ngcspnonce="${rootNonce}"`).replace(NONCE_PLACEHOLDER, nonce);
}

/** @type {import('../security-server.mjs').RouteModule} */
export default {
  name: '05-csp',
  match: (url) => url.pathname === '/m33/csp' || url.pathname === '/autocsp/m33/csp',
  async handle(_req, res, url, ctx) {
    const autocsp = url.pathname.startsWith('/autocsp/');
    const header = url.searchParams.has('report-only') ? 'content-security-policy-report-only' : 'content-security-policy';
    res
      .writeHead(200, {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        [header]: autocsp ? AUTOCSP_POLICY : noncePolicy(ctx),
      })
      .end(await shell(url, autocsp, ctx.nonce));
  },
};
