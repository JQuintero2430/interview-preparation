// Fixture server for module 30: serves the labs/angular production build and a per-tenant todos API.
// Node built-ins only; prints nothing. Tenant = the `m30-tenant` cookie (`public` when absent).
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../angular/dist/labs/browser/', import.meta.url));
const PORT = Number(process.env.PORT ?? 4300);
const MAX_BODY = 1_000_000;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
};

/** tenant → { todos, nextId, scenario, log } */
const tenants = new Map();

function tenantOf(req) {
  const match = /(?:^|;\s*)m30-tenant=([^;]+)/.exec(req.headers.cookie ?? '');
  const name = match ? decodeURIComponent(match[1]) : 'public';
  if (!tenants.has(name)) tenants.set(name, { todos: [], nextId: 1, scenario: null, log: [] });
  return tenants.get(name);
}

function send(res, status, body, type = 'application/json') {
  if (body === undefined) return res.writeHead(status).end();
  res.writeHead(status, { 'content-type': type }).end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

function problem(res, status, detail) {
  send(res, status, { type: 'about:blank', title: status === 404 ? 'Not Found' : 'Bad Request', status, detail }, 'application/problem+json');
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY) throw new Error('Body too large');
  }
  return raw ? JSON.parse(raw) : undefined;
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function listTodos(tenant, url, res) {
  const scenario = tenant.scenario;
  tenant.scenario = null;
  if (scenario) {
    await delay(scenario.delayMs ?? 0);
    return send(res, scenario.status ?? 200, scenario.body ?? tenant.todos);
  }
  const q = (url.searchParams.get('q') ?? '').toLowerCase();
  send(res, 200, tenant.todos.filter((todo) => todo.title.toLowerCase().includes(q)));
}

function createTodo(tenant, body, res) {
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  if (!title) return problem(res, 400, 'Title is required');
  const todo = { id: tenant.nextId++, title, done: false };
  tenant.todos.push(todo);
  send(res, 201, todo);
}

function deleteTodo(tenant, id, res) {
  const before = tenant.todos.length;
  tenant.todos = tenant.todos.filter((todo) => todo.id !== id);
  return tenant.todos.length < before ? send(res, 204) : problem(res, 404, `No todo ${id}`);
}

function reset(tenant, body, res) {
  const seed = Array.isArray(body) ? body : [];
  tenant.todos = seed.map((todo, i) => ({ id: todo.id ?? i + 1, title: String(todo.title), done: !!todo.done }));
  tenant.nextId = Math.max(0, ...tenant.todos.map((todo) => todo.id)) + 1;
  tenant.scenario = null;
  tenant.log = [];
  send(res, 204);
}

async function api(req, res, url) {
  const tenant = tenantOf(req);
  const body = req.method === 'POST' ? await readJson(req) : undefined;
  const path = url.pathname;
  if (path === '/api/__reset' && req.method === 'POST') return reset(tenant, body, res);
  if (path === '/api/__scenario' && req.method === 'POST') return (tenant.scenario = body ?? null), send(res, 204);
  if (path === '/api/__log' && req.method === 'GET') return send(res, 200, tenant.log);

  tenant.log.push({ method: req.method, url: path + url.search, ...(body === undefined ? {} : { body }) });
  if (path === '/api/todos' && req.method === 'GET') return listTodos(tenant, url, res);
  if (path === '/api/todos' && req.method === 'POST') return createTodo(tenant, body, res);
  const match = /^\/api\/todos\/(\d+)$/.exec(path);
  if (match && req.method === 'DELETE') return deleteTodo(tenant, Number(match[1]), res);
  problem(res, 404, `No route ${req.method} ${path}`);
}

async function staticFile(res, url) {
  const file = normalize(join(ROOT, decodeURIComponent(url.pathname)));
  const inRoot = file.startsWith(ROOT) && !file.endsWith(sep);
  const isAppRoute = /^\/m3[01](\/|$)/.test(url.pathname);
  try {
    if (!inRoot) throw new Error('fallback');
    send(res, 200, await readFile(file), TYPES[extname(file)] ?? 'application/octet-stream');
  } catch {
    if (!isAppRoute && url.pathname !== '/') return problem(res, 404, `No file ${url.pathname}`);
    send(res, 200, await readFile(join(ROOT, 'index.html')), TYPES['.html']);
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  try {
    await (url.pathname.startsWith('/api/') ? api(req, res, url) : staticFile(res, url));
  } catch {
    if (!res.headersSent) problem(res, 400, 'Malformed request');
  }
}).listen(PORT);
