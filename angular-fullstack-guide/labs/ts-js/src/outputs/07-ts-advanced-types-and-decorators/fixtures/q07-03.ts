interface User {
  readonly id: string;
  name: string;
  email?: string;
}

type A = keyof User;
type B = { -readonly [K in keyof User]-?: User[K] };
type C = { [K in 'id' | 'email']: User[K] };
type D = { [K in keyof User as `get${Capitalize<K>}`]: () => User[K] };
type E = `${'drag' | 'resize'}:${'start' | 'end'}`;
