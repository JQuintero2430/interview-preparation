import { Injectable, signal } from '@angular/core';

/** The `localStorage` key of the `local` page's access token. */
export const LAB_M33_TOKEN_KEY = 'm33-access-token';

/**
 * Where a Section 8 page keeps its credential: one strategy per route, given in the route's `providers`.
 * `bearer`: the API returns an access token the page sends back in `Authorization`;
 * `cookie`: the API sets an `HttpOnly` session cookie the browser sends by itself.
 */
export abstract class LabM33TokenStore {
  abstract readonly mode: 'bearer' | 'cookie';
  abstract readonly label: string;
  abstract read(): string | null;
  abstract save(token: string): void;
}

/** Readable by every script on the origin, and still there after a reload. */
@Injectable()
export class LabM33LocalStorageStore extends LabM33TokenStore {
  readonly mode = 'bearer';
  readonly label = 'localStorage';
  read(): string | null {
    return localStorage.getItem(LAB_M33_TOKEN_KEY);
  }
  save(token: string): void {
    localStorage.setItem(LAB_M33_TOKEN_KEY, token);
  }
}

/** In no store: a signal in a route-level service, gone when the page reloads. */
@Injectable()
export class LabM33MemoryStore extends LabM33TokenStore {
  readonly mode = 'bearer';
  readonly label = 'memory';
  private readonly token = signal<string | null>(null);
  read(): string | null {
    return this.token();
  }
  save(token: string): void {
    this.token.set(token);
  }
}

/** No token in the page at all: the browser keeps the `HttpOnly` cookie and attaches it. */
@Injectable()
export class LabM33CookieSession extends LabM33TokenStore {
  readonly mode = 'cookie';
  readonly label = 'HttpOnly cookie';
  read(): string | null {
    return null;
  }
  save(): void {
    // Nothing to keep: the Set-Cookie header already did it.
  }
}
