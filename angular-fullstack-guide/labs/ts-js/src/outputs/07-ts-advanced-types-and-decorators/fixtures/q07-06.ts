type IsString<T> = T extends string ? 'yes' : 'no';
type Wrapped<T> = [T] extends [string] ? 'yes' : 'no';
type ToArray<T> = T extends unknown ? T[] : never;

type A = IsString<'a' | 1>;
type B = Wrapped<'a' | 1>;
type C = IsString<never>;
type D = Wrapped<never>;
type E = ToArray<string | number>;
type F = Exclude<'a' | 'b' | 1, string>;
