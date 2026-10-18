// @ts-check
// Section 1 (SEC-M33-01): the order API of the threat-model page. The server owns the price list:
// it reads only the item from the body, ignores the price the client sends, and logs both.
// Node built-ins only.

/** The server's catalog: the only prices it charges. */
const CATALOG = new Map([
  ['book', 25],
  ['pen', 3],
]);
const MAX_BODY = 10_000;

/** @param {import('node:http').IncomingMessage} req @returns {Promise<unknown>} */
async function readJson(req) {
  /** @type {Buffer[]} */
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.byteLength;
    if (size > MAX_BODY) throw new Error('Body too large');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null');
}

/** @param {import('node:http').ServerResponse} res @param {number} status @param {unknown} body */
function sendJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(body));
}

/** @type {import('../security-server.mjs').RouteModule} */
export default {
  name: '01-threat',
  match: (url) => url.pathname === '/api/m33/threat/order',
  async handle(req, res, _url, ctx) {
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'POST only' });
    const body = await readJson(req);
    const order = typeof body === 'object' && body !== null ? body : {};
    const item = 'item' in order && typeof order.item === 'string' ? order.item : '';
    const total = CATALOG.get(item);
    if (total === undefined) return sendJson(res, 400, { error: 'unknown item' });
    ctx.log({ item, clientPrice: 'price' in order ? order.price : null, total });
    sendJson(res, 201, { item, total });
  },
};
