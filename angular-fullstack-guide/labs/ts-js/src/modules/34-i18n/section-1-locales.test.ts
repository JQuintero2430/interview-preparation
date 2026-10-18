// Section 1 claims: a BCP 47 language tag is case-insensitive and has a canonical form, it splits into
// language, optional script and optional region subtags, and a runtime reports which tags it can format.
// Results are Node 24's `Intl` (ICU 78.3, CLDR 48.0); a browser can differ.

describe('Section 1: language tags with Intl', () => {
  it('Section 1: getCanonicalLocales normalizes the case of a tag', () => {
    expect(Intl.getCanonicalLocales(['EN-us', 'zh-hant-tw', 'fr-ca'])).toEqual(['en-US', 'zh-Hant-TW', 'fr-CA']);
  });

  it('Section 1: Intl.Locale splits a tag into language, script and region', () => {
    const chinese = new Intl.Locale('zh-Hant-TW');
    expect([chinese.language, chinese.script, chinese.region]).toEqual(['zh', 'Hant', 'TW']);

    // Same region, different language: a region alone does not name a locale.
    expect([new Intl.Locale('fr-CA').language, new Intl.Locale('fr-CA').region]).toEqual(['fr', 'CA']);
    expect([new Intl.Locale('en-CA').language, new Intl.Locale('en-CA').region]).toEqual(['en', 'CA']);

    // Only the language subtag is required.
    const french = new Intl.Locale('fr');
    expect([french.language, french.script, french.region]).toEqual(['fr', undefined, undefined]);
  });

  it('Section 1: supportedLocalesOf drops a tag the runtime cannot format', () => {
    expect(Intl.DateTimeFormat.supportedLocalesOf(['fr-CA', 'xx-YY', 'de'])).toEqual(['fr-CA', 'de']);
  });
});
