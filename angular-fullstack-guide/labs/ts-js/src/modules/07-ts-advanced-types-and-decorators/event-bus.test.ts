import { createEventBus } from './event-bus';
import { typecheck } from '../06-ts-type-system-essentials/typecheck';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync } = (await import(fsSpecifier)) as { readFileSync: (path: URL, encoding: 'utf8') => string };

const BUS_SOURCE = readFileSync(new URL('./event-bus.ts', import.meta.url), 'utf8');
/** Compiles `code` against the real `event-bus.ts`; diagnostics in `code` read `line N: TSxxxx` (N counted from `code`'s first line). */
const consumerCodes = (code: string) =>
  typecheck(`import { createEventBus } from './event-bus';\ntype AppEvents = { login: { user: string }; cartCleared: void };\nconst bus = createEventBus<AppEvents>();\n${code}`, undefined, {
    '/virtual/event-bus.ts': BUS_SOURCE,
  })
    .map(({ file, line, code: diagnostic }) => (file === '/virtual/main.ts' ? `line ${line - 3}: TS${diagnostic}` : `${file}: TS${diagnostic}`));

type AppEvents = { login: { user: string }; cartCleared: void };

describe('E07.1 createEventBus', () => {
  it("handlers receive their event's payload in registration order", () => {
    const bus = createEventBus<AppEvents>();
    const seen: string[] = [];
    bus.on('login', ({ user }) => seen.push(`first ${user}`));
    bus.on('login', ({ user }) => seen.push(`second ${user}`));
    bus.on('cartCleared', () => seen.push('cleared'));
    bus.emit('login', { user: 'ann' });
    expect(seen).toEqual(['first ann', 'second ann']);
  });

  it('the returned function unsubscribes', () => {
    const bus = createEventBus<AppEvents>();
    const seen: string[] = [];
    const off = bus.on('login', ({ user }) => {
      seen.push(`once ${user}`);
      off();
    });
    bus.on('login', ({ user }) => seen.push(`always ${user}`));
    bus.emit('login', { user: 'ann' });
    bus.emit('login', { user: 'bo' });
    off();
    expect(seen).toEqual(['once ann', 'always ann', 'always bo']);
  });

  it('an unknown event name is a compile error', () => {
    expect(consumerCodes("bus.emit('logout', { user: 'ann' });\nbus.on('logni', () => {});")).toEqual(['line 1: TS2345', 'line 2: TS2345']);
  });

  it('a wrong payload type is a compile error', () => {
    expect(consumerCodes("bus.emit('login', { user: 42 });\nbus.emit('login', { name: 'ann' });\nbus.on('login', (payload: { id: number }) => payload.id);")).toEqual([
      'line 1: TS2322',
      'line 2: TS2353',
      'line 3: TS2345',
    ]);
  });

  it('an event whose payload is void can be emitted without an argument (a conditional rest-parameter type)', () => {
    expect(consumerCodes("bus.emit('cartCleared');\nbus.emit('login');\nbus.emit('cartCleared', 'now');")).toEqual(['line 2: TS2554', 'line 3: TS2554']);
    const bus = createEventBus<AppEvents>();
    const payloads: unknown[] = [];
    bus.on('cartCleared', (payload) => payloads.push(payload));
    bus.emit('cartCleared');
    expect(payloads).toEqual([undefined]);
  });

  it('evidence for the follow-up: an interface does not satisfy Record<string, unknown> (TS2344), a type alias does', () => {
    expect(consumerCodes('interface Named { login: { user: string } }\nexport const named = createEventBus<Named>();')).toEqual(['line 2: TS2344']);
  });
});
