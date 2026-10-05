export type Catalog = Readonly<Record<string, string>>;
export type Values = Readonly<Record<string, string | number>>;

const PLURAL_RE = /\{(\w+),\s*plural,\s*((?:[^{}]*\{[^{}]*\})+)\s*\}/g;
const BRANCH_RE = /(=\d+|\w+)\s*\{([^{}]*)\}/g;

/**
 * A deliberately tiny ICU-subset translator: `{name}` and `{n, plural, one {# item} other {# items}}`.
 * Plural categories come from the built-in `Intl.PluralRules`, numbers from `Intl.NumberFormat`.
 * For real products use FormatJS / react-intl or i18next (22.8).
 */
export function createTranslator(locale: string, catalog: Catalog, fallback: Catalog = {}, onMissing?: (key: string) => void) {
  const numbers = new Intl.NumberFormat(locale);
  const plurals = new Intl.PluralRules(locale);

  function plural(count: number, branchesSource: string): string {
    const branches = new Map<string, string>();
    for (const m of branchesSource.matchAll(BRANCH_RE)) {
      if (m[1] !== undefined && m[2] !== undefined) branches.set(m[1], m[2]);
    }
    const chosen = branches.get(`=${count}`) ?? branches.get(plurals.select(count)) ?? branches.get('other') ?? '';
    return chosen.replaceAll('#', numbers.format(count));
  }

  return function t(key: string, values: Values = {}): string {
    const template = catalog[key] ?? fallback[key];
    if (template === undefined) {
      onMissing?.(key);
      return key;
    }
    return template
      .replace(PLURAL_RE, (_all, name: string, branches: string) => plural(Number(values[name] ?? 0), branches))
      .replace(/\{(\w+)\}/g, (whole, name: string) => {
        const value = values[name];
        if (value === undefined) return whole;
        return typeof value === 'number' ? numbers.format(value) : value;
      });
  };
}

/** Locale-aware formatting with nothing but `Intl`. Create once per locale, not per render. */
export function createFormatters(locale: string) {
  return {
    currency: (amount: number, currency: string) => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount),
    date: (date: Date, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) => new Intl.DateTimeFormat(locale, options).format(date),
    relative: (value: number, unit: Intl.RelativeTimeFormatUnit) => new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(value, unit),
    list: (items: string[]) => new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(items),
  };
}
