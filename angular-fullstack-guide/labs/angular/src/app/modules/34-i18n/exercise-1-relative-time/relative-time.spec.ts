import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LabM34RelativeTimePipe } from './relative-time.pipe';
import { LabM34RelativeTimeService } from './relative-time.service';

type Format = (value: Date | number, now: Date | number) => string;

const NOW = Date.UTC(2024, 6, 8, 12, 0, 0);
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function withLocale(locale: string): void {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: locale }] });
}

describe.each<{ variant: string; create: (locale: string) => Format }>([
  {
    variant: 'pure pipe with a module-level cache',
    create: (locale) => {
      withLocale(locale);
      const pipe = TestBed.runInInjectionContext(() => new LabM34RelativeTimePipe());
      return (value, now) => pipe.transform(value, now);
    },
  },
  {
    variant: 'root service',
    create: (locale) => {
      withLocale(locale);
      const service = TestBed.inject(LabM34RelativeTimeService);
      return (value, now) => service.format(value, now);
    },
  },
])('Exercise 34.1: a relative-time pipe ($variant)', ({ create }) => {
  afterEach(() => vi.restoreAllMocks());

  it('shows yesterday for a time one day earlier in English', () => {
    expect(create('en')(NOW - DAY, NOW)).toBe('yesterday');
  });

  it('shows the French phrase when LOCALE_ID is fr', () => {
    expect(create('fr')(NOW - DAY, NOW)).toBe('hier');
    expect(create('fr')(NOW - 3 * HOUR, new Date(NOW))).toBe('il y a 3 heures');
  });

  it('picks seconds, minutes, hours or days by distance', () => {
    const format = create('en');

    expect(format(NOW - 30 * SECOND, NOW)).toBe('30 seconds ago');
    expect(format(NOW - 59 * SECOND, NOW)).toBe('59 seconds ago');
    expect(format(NOW - MINUTE, NOW)).toBe('1 minute ago');
    expect(format(NOW - 5 * MINUTE, NOW)).toBe('5 minutes ago');
    expect(format(NOW - 3 * HOUR, NOW)).toBe('3 hours ago');
    expect(format(new Date(NOW - 3 * DAY), NOW)).toBe('3 days ago');
    expect(format(NOW - 40 * DAY, NOW)).toBe('40 days ago');
  });

  it('formats a later time as a future phrase', () => {
    const format = create('en');

    expect(format(NOW + 2 * DAY, NOW)).toBe('in 2 days');
    expect(format(NOW + DAY, NOW)).toBe('tomorrow');
    expect(format(NOW + 5 * MINUTE, NOW)).toBe('in 5 minutes');
  });

  it('creates one formatter per locale', () => {
    // 'sv' and 'pt' appear in no other test, so the pipe's module-level map is empty for them.
    const construct = vi.spyOn(Intl, 'RelativeTimeFormat');
    const swedish = create('sv');
    swedish(NOW - DAY, NOW);
    swedish(NOW - 2 * DAY, NOW);
    swedish(NOW - 3 * DAY, NOW);
    const portuguese = create('pt');
    portuguese(NOW - DAY, NOW);
    portuguese(NOW - 2 * DAY, NOW);

    expect(construct.mock.calls.map(([locale]) => locale)).toEqual(['sv', 'pt']);
  });
});
