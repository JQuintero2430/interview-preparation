import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { API_BASE, type User } from '../api';

export const ada: User = { id: '1', name: 'Ada Lovelace', email: 'ada@example.test' };
export const alan: User = { id: '2', name: 'Alan Turing', email: 'alan@example.test' };
const users: Record<string, User> = { [ada.id]: ada, [alan.id]: alan };

export const USER_URL = `${API_BASE}/users/:id`;

/** Happy-path handlers shared by every test file. A test overrides one with server.use(). */
export const handlers = [
  http.get(USER_URL, ({ params }) => {
    const user = users[String(params.id)];
    return user ? HttpResponse.json(user) : new HttpResponse(null, { status: 404 });
  }),
];

/**
 * Each test file gets its own instance (Vitest isolates modules per file) and wires the lifecycle:
 * beforeAll(listen) / afterEach(resetHandlers) / afterAll(close).
 */
export const server = setupServer(...handlers);
