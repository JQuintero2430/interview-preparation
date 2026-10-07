declare function tuple<const T extends readonly string[]>(items: T): T;
declare function plain<T extends readonly string[]>(items: T): T;
declare function withDefault<T extends string>(options: T[], fallback: T): T;
declare function strictDefault<T extends string>(options: T[], fallback: NoInfer<T>): T;

const a = tuple(['sm', 'md']);
const b = plain(['sm', 'md']);
const c = withDefault(['sm', 'md'], 'lg');
const d = strictDefault(['sm', 'md'], 'lg');
