import { createLogger, redact, scrubUrl, type LogRecord } from './logger';

const fixed = () => new Date('2026-01-15T10:00:00.000Z');

function setup(level: 'debug' | 'info' | 'warn' | 'error' = 'info') {
  const records: LogRecord[] = [];
  const logger = createLogger({ level, sink: (r) => records.push(r), now: fixed, context: { release: 'abc123' } });
  return { records, logger };
}

test('records below the level are dropped', () => {
  const { records, logger } = setup('warn');
  logger.debug('d');
  logger.info('i');
  logger.warn('w');
  logger.error('e');
  expect(records.map((r) => r.level)).toEqual(['warn', 'error']);
});

test('a record carries time, base context and call context', () => {
  const { records, logger } = setup();
  logger.info('loaded', { route: '/cart' });
  expect(records[0]).toEqual({ level: 'info', message: 'loaded', time: '2026-01-15T10:00:00.000Z', context: { release: 'abc123', route: '/cart' } });
});

test('child loggers add context without mutating the parent', () => {
  const { records, logger } = setup();
  logger.child({ feature: 'cart' }).info('a');
  logger.info('b');
  expect(records[0]?.context).toEqual({ release: 'abc123', feature: 'cart' });
  expect(records[1]?.context).toEqual({ release: 'abc123' });
});

test('sensitive keys are masked at any depth and errors are flattened', () => {
  const { records, logger } = setup();
  logger.error('failed', { user: { email: 'a@b.c', id: 7 }, headers: { Authorization: 'Bearer x' }, err: new TypeError('boom') });
  expect(records[0]?.context).toEqual({
    release: 'abc123',
    user: { email: '[redacted]', id: 7 },
    headers: { Authorization: '[redacted]' },
    err: { name: 'TypeError', message: 'boom' },
  });
});

test('redact caps depth so a cyclic object cannot loop forever', () => {
  const cyclic: Record<string, unknown> = {};
  cyclic['self'] = cyclic;
  expect(JSON.stringify(redact(cyclic))).toContain('[truncated]');
});

test('a throwing sink never throws into the caller', () => {
  const logger = createLogger({
    level: 'info',
    sink: () => {
      throw new Error('transport down');
    },
  });
  expect(() => logger.error('x')).not.toThrow();
});

describe('scrubUrl', () => {
  test('masks sensitive parameters and keeps the rest', () => {
    expect(scrubUrl('https://app.test/cb?code=abc&page=2')).toBe('https://app.test/cb?code=REDACTED&page=2');
  });

  test('relative URLs stay relative', () => {
    expect(scrubUrl('/reset?token=xyz')).toBe('/reset?token=REDACTED');
  });
});
