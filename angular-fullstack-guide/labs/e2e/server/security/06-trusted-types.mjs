// @ts-check
// Section 6 (SEC-M33-06): the Trusted Types pages' shell with a Trusted Types policy header. Node built-ins only.
// `/m33/tt` and `/m33/tt/…` (nonce build) answer index.html with
// `require-trusted-types-for 'script'; trusted-types angular; report-uri /__csp-report?run=…`.
// Query flags: `allow-bypass` adds `angular#unsafe-bypass` to the allowed policy names; `report-only` sends the
// policy as `Content-Security-Policy-Report-Only`.
import { readFile } from 'node:fs/promises';

const SHELL = new URL('../../../angular/dist/security-lab/browser/index.html', import.meta.url);
const NONCE_PLACEHOLDER = /__CSP_NONCE__/g;

/** @param {URL} url @param {string} run */
function trustedTypesPolicy(url, run) {
  const names = url.searchParams.has('allow-bypass') ? 'angular angular#unsafe-bypass' : 'angular';
  return [
    `require-trusted-types-for 'script'`,
    `trusted-types ${names}`,
    `report-uri /__csp-report?run=${encodeURIComponent(run)}`,
  ].join('; ');
}

/** @type {import('../security-server.mjs').RouteModule} */
export default {
  name: '06-trusted-types',
  match: (url) => url.pathname === '/m33/tt' || url.pathname.startsWith('/m33/tt/'),
  async handle(_req, res, url, ctx) {
    const header = url.searchParams.has('report-only')
      ? 'content-security-policy-report-only'
      : 'content-security-policy';
    const shell = await readFile(SHELL, 'utf8');
    res
      .writeHead(200, {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        [header]: trustedTypesPolicy(url, ctx.run),
      })
      .end(shell.replace(NONCE_PLACEHOLDER, ctx.nonce));
  },
};
