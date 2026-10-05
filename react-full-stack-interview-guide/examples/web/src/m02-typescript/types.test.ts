import { expectTypeOf } from 'vitest';
import {
  asOrderId,
  asUserId,
  firstOr,
  pick,
  routes,
  tuple,
  type Consumer,
  type ElementOf,
  type Getters,
  type HandlerName,
  type Mutable,
  type OrderId,
  type Prettify,
  type Producer,
  type RouteName,
  type UserId,
} from './types';

class Animal {
  name = 'animal';
}
class Dog extends Animal {
  bark() {
    return 'woof';
  }
}

describe('type-level utilities (compile-time, checked by tsc)', () => {
  it('Getters remaps keys with a template literal', () => {
    expectTypeOf<Getters<{ name: string; age: number }>>().toEqualTypeOf<{
      getName: () => string;
      getAge: () => number;
    }>();
  });

  it('ElementOf infers the element type', () => {
    expectTypeOf<ElementOf<readonly string[]>>().toEqualTypeOf<string>();
    expectTypeOf<ElementOf<string>>().toEqualTypeOf<never>();
  });

  it('HandlerName builds a template-literal type', () => {
    expectTypeOf<HandlerName<'click' | 'focus'>>().toEqualTypeOf<'onClick' | 'onFocus'>();
  });

  it('Mutable removes readonly; Prettify keeps the shape', () => {
    expectTypeOf<Mutable<{ readonly a: 1 }>>().toEqualTypeOf<{ a: 1 }>();
    expectTypeOf<Prettify<{ a: 1 } & { b: 2 }>>().toEqualTypeOf<{ a: 1; b: 2 }>();
  });

  it('built-in utilities', () => {
    expectTypeOf<Awaited<Promise<Promise<number>>>>().toEqualTypeOf<number>();
    expectTypeOf<ReturnType<typeof asUserId>>().toEqualTypeOf<UserId>();
    expectTypeOf<Omit<{ a: 1; b: 2 }, 'a'>>().toEqualTypeOf<{ b: 2 }>();
    expectTypeOf<Required<{ a?: 1 }>>().toEqualTypeOf<{ a: 1 }>();
    expectTypeOf<NonNullable<string | null | undefined>>().toEqualTypeOf<string>();
    expectTypeOf<Record<'x' | 'y', number>>().toEqualTypeOf<{ x: number; y: number }>();
  });

  it('brands keep structurally identical strings apart', () => {
    const notCalled = [
      // @ts-expect-error - an OrderId is not a UserId even though both are strings underneath
      (order: OrderId): UserId => order,
      // @ts-expect-error - a raw string is not a UserId
      (raw: string): UserId => raw,
    ];
    expect(notCalled).toHaveLength(2);
    expectTypeOf(asOrderId('o1')).toExtend<string>();
  });

  it('pick ties the keys to the object', () => {
    const user = { id: 1, name: 'Ada', admin: true };
    expectTypeOf(pick(user, 'id', 'name')).toEqualTypeOf<{ id: number; name: string }>();
    // @ts-expect-error - 'nmae' is not a key of user
    pick(user, 'nmae');
  });

  it('const type parameters infer readonly literal tuples', () => {
    expectTypeOf(tuple('a', 1)).toEqualTypeOf<readonly ['a', 1]>();
  });

  it('NoInfer stops the fallback from widening T', () => {
    expectTypeOf(firstOr(['a', 'b'] as const, 'a')).toEqualTypeOf<'a' | 'b'>();
    // @ts-expect-error - 'c' is not 'a' | 'b'; without NoInfer, T would silently widen to 'a' | 'b' | 'c'
    firstOr(['a', 'b'] as const, 'c');
  });

  it('variance annotations: producers are covariant, consumers contravariant', () => {
    const okProducer = (p: Producer<Dog>): Producer<Animal> => p;
    const okConsumer = (c: Consumer<Animal>): Consumer<Dog> => c;
    // @ts-expect-error - a Producer<Animal> may hand out a non-Dog
    const badProducer = (p: Producer<Animal>): Producer<Dog> => p;
    // @ts-expect-error - a Consumer<Dog> cannot accept every Animal
    const badConsumer = (c: Consumer<Dog>): Consumer<Animal> => c;
    expect([okProducer, okConsumer, badProducer, badConsumer]).toHaveLength(4);
  });

  it('satisfies validates without widening', () => {
    expectTypeOf(routes.user).toEqualTypeOf<'/users/:id'>();
    expectTypeOf<RouteName>().toEqualTypeOf<'home' | 'user'>();
  });

  it('arrays are covariant (unsound) in TypeScript, unlike Java generics', () => {
    const dogs: Dog[] = [new Dog()];
    const animals: Animal[] = dogs; // compiles: the same hole Java closes with invariance
    animals.push(new Animal()); // ...and now `dogs` holds a non-Dog
    expect(dogs).toHaveLength(2);
  });
});
