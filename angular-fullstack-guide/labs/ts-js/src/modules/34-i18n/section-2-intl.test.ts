// Section 2 claims: Intl formatters are built once from a locale and options, the runtime's ICU and CLDR supply the data,
// and the same input prints differently per locale and time zone. Results are Node 24's `Intl` (ICU 78.3, CLDR 48.0);
// a browser can differ. Every date passes `timeZone`: the machine's own zone would leak into the output.

/** Node's `process.versions`, read through `globalThis` because this project's types do not include Node's. */
function nodeVersions(): unknown {
  const nodeProcess: unknown = Reflect.get(globalThis, 'process');
  return typeof nodeProcess === 'object' && nodeProcess !== null && 'versions' in nodeProcess ? nodeProcess.versions : undefined;
}

describe('Section 2: the platform Intl APIs', () => {
  it('Section 2: DateTimeFormat formats one instant differently per locale and time zone', () => {
    const instant = new Date('2024-07-08T02:30:00Z');
    const long = { dateStyle: 'long' } as const;

    expect(new Intl.DateTimeFormat('en-US', { ...long, timeZone: 'UTC' }).format(instant)).toBe('July 8, 2024');
    expect(new Intl.DateTimeFormat('de', { ...long, timeZone: 'UTC' }).format(instant)).toBe('8. Juli 2024');
    // The same instant is still July 7 in New York (UTC-4 in July) and already July 8 in Tokyo.
    expect(new Intl.DateTimeFormat('en-US', { ...long, timeZone: 'America/New_York' }).format(instant)).toBe('July 7, 2024');
    expect(new Intl.DateTimeFormat('en-US', { ...long, timeZone: 'Asia/Tokyo' }).format(instant)).toBe('July 8, 2024');
  });

  it('Section 2: NumberFormat groups and decimals per locale', () => {
    expect(new Intl.NumberFormat('en-US').format(1234567.891)).toBe('1,234,567.891');
    expect(new Intl.NumberFormat('de').format(1234567.891)).toBe('1.234.567,891');
    expect(new Intl.NumberFormat('en', { notation: 'compact' }).format(1_234_567)).toBe('1.2M');
    expect(new Intl.NumberFormat('en', { style: 'unit', unit: 'kilometer-per-hour' }).format(50)).toBe('50 km/h');
  });

  it('Section 2: PluralRules returns different categories per language', () => {
    const categories = (locale: string, values: number[], type: Intl.PluralRulesOptions['type'] = 'cardinal') =>
      values.map((value) => new Intl.PluralRules(locale, { type }).select(value));

    expect(categories('en', [0, 1, 2, 5])).toEqual(['other', 'one', 'other', 'other']);
    expect(categories('fr', [0, 1, 1.5, 2])).toEqual(['one', 'one', 'one', 'other']);
    expect(categories('ar', [0, 1, 2, 3, 11, 100])).toEqual(['zero', 'one', 'two', 'few', 'many', 'other']);
    expect(categories('ru', [1, 2, 5, 21, 1.5])).toEqual(['one', 'few', 'many', 'one', 'other']);
    expect(categories('en', [1, 2, 3, 4, 11, 21], 'ordinal')).toEqual(['one', 'two', 'few', 'other', 'other', 'one']);
  });

  it('Section 2: RelativeTimeFormat with numeric auto says yesterday', () => {
    expect(new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-1, 'day')).toBe('yesterday');
    expect(new Intl.RelativeTimeFormat('en').format(-1, 'day')).toBe('1 day ago');
    expect(new Intl.RelativeTimeFormat('es', { numeric: 'auto' }).format(2, 'day')).toBe('pasado mañana');
  });

  it('Section 2: ListFormat joins with the locale\'s conjunction', () => {
    const items = ['a', 'b', 'c'];

    expect(new Intl.ListFormat('en', { type: 'conjunction' }).format(items)).toBe('a, b, and c');
    expect(new Intl.ListFormat('de', { type: 'conjunction' }).format(items)).toBe('a, b und c');
  });

  it('Section 2: Collator orders ä differently in German and Swedish', () => {
    const letters = ['ä', 'a', 'z'];

    expect([...letters].sort(new Intl.Collator('de').compare)).toEqual(['a', 'ä', 'z']);
    expect([...letters].sort(new Intl.Collator('sv').compare)).toEqual(['a', 'z', 'ä']);
    // Plain sort() compares UTF-16 code units: ä (U+00E4) comes after z (U+007A).
    expect([...letters].sort()).toEqual(['a', 'z', 'ä']);
  });

  it('Section 2: a numeric Collator puts item2 before item10', () => {
    const items = ['item10', 'item2', 'item9'];

    expect([...items].sort(new Intl.Collator('en', { numeric: true }).compare)).toEqual(['item2', 'item9', 'item10']);
    expect([...items].sort(new Intl.Collator('en').compare)).toEqual(['item10', 'item2', 'item9']);
  });

  it('Section 2: DisplayNames names a region in the reader\'s language', () => {
    expect(new Intl.DisplayNames(['en'], { type: 'region' }).of('DE')).toBe('Germany');
    expect(new Intl.DisplayNames(['de'], { type: 'language' }).of('fr')).toBe('Französisch');
  });

  it('Section 2: word segmentation of Japanese text finds words without spaces', () => {
    const text = '私は東京に住んでいます';
    const words = [...new Intl.Segmenter('ja', { granularity: 'word' }).segment(text)];

    expect(words.map((part) => part.segment)).toEqual(['私', 'は', '東京', 'に', '住', 'んで', 'い', 'ます']);
    expect(words.every((part) => part.isWordLike)).toBe(true);
    // In Node 24 the locale does not change this text: 'en' finds the same boundaries, so the dictionary is script-based.
    const withEnglish = [...new Intl.Segmenter('en', { granularity: 'word' }).segment(text)];
    expect(withEnglish.map((part) => part.segment)).toEqual(words.map((part) => part.segment));
  });

  it('Section 2: resolvedOptions reports the numbering system', () => {
    expect(new Intl.NumberFormat('ar-EG').resolvedOptions().numberingSystem).toBe('arab');
    expect(new Intl.NumberFormat('ar').resolvedOptions().numberingSystem).toBe('latn');
    expect(new Intl.NumberFormat('ar-EG').format(1234.5)).toBe('١٬٢٣٤٫٥');

    // The other Locale and duration APIs MDN lists as newly available.
    expect(new Intl.Locale('ar-EG').getTextInfo()).toEqual({ direction: 'rtl' });
    expect(new Intl.Locale('en-US').getWeekInfo().firstDay).toBe(7);
    expect(new Intl.Locale('de-DE').getWeekInfo().firstDay).toBe(1);
    expect(new Intl.DurationFormat('en', { style: 'long' }).format({ hours: 1, minutes: 30 })).toBe('1 hour, 30 minutes');
    // The runtime that supplies the data: Node 24.21.0 reports ICU 78.3 and CLDR 48.0.
    expect(nodeVersions()).toMatchObject({ icu: '78.3', cldr: '48.0' });
  });
});
