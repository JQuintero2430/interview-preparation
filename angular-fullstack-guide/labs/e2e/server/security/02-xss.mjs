// @ts-check
// Section 2 (SEC-M33-02): the shell of the sinks page with a literal template expression in the served HTML.
// `/m33/xss/sinks?braces` answers the nonce build's index.html with `<p id="braces">{{ 7 * 7 }}</p>` before the
// application root; every other request goes on to the static files. Node built-ins only.
import { readFile } from 'node:fs/promises';

const SHELL = new URL('../../../angular/dist/security-lab/browser/index.html', import.meta.url);
const NONCE_PLACEHOLDER = /__CSP_NONCE__/g;
const BRACES = '<p id="braces">{{ 7 * 7 }}</p>';

/** @type {import('../security-server.mjs').RouteModule} */
export default {
  name: '02-xss',
  match: (url) => url.pathname === '/m33/xss/sinks' && url.searchParams.has('braces'),
  async handle(_req, res, _url, ctx) {
    const shell = (await readFile(SHELL, 'utf8')).replace('<lab-root', `${BRACES}<lab-root`);
    res
      .writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
      .end(shell.replace(NONCE_PLACEHOLDER, ctx.nonce));
  },
};
