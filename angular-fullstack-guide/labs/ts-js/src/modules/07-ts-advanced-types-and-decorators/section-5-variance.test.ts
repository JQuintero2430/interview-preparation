// Section 5 claims: covariance and contravariance, strictFunctionTypes, method bivariance, array covariance, in/out annotations.
import { LAB_OPTIONS, typecheck } from '../06-ts-type-system-essentials/typecheck';

const linesAndCodes = (code: string, options = LAB_OPTIONS) =>
  typecheck(code, options).map(({ line, code: diagnostic }) => `line ${line}: TS${diagnostic}`);

const ANIMALS = 'interface Animal { name: string }\ninterface Dog extends Animal { bark(): string }\n';
const DOG_HANDLER = 'export const bus: Bus = { onEvent: (dog: Dog) => { dog.bark(); } };';

interface Animal {
  name: string;
}
interface Dog extends Animal {
  bark(): string;
}

describe('Module 07 · section 5', () => {
  it('Section 5: a handler that needs a Dog is rejected where any Animal may arrive (TS2322), unless strictFunctionTypes is off', () => {
    const PROPERTY_SYNTAX = `${ANIMALS}interface Bus { onEvent: (animal: Animal) => void }\n${DOG_HANDLER}`;
    expect(linesAndCodes(PROPERTY_SYNTAX)).toEqual(['line 4: TS2322']);
    expect(linesAndCodes(PROPERTY_SYNTAX, { ...LAB_OPTIONS, strictFunctionTypes: false })).toEqual([]);
    expect(linesAndCodes(`${ANIMALS}export const forDogs: (dog: Dog) => void = (animal: Animal) => { animal.name; };`)).toEqual([]);
  });

  it('Section 5: declared with method syntax, the same handler compiles under strict and crashes at run time', () => {
    expect(linesAndCodes(`${ANIMALS}interface Bus { onEvent(animal: Animal): void }\n${DOG_HANDLER}`)).toEqual([]);
    interface Bus {
      onEvent(animal: Animal): void;
    }
    const bus: Bus = { onEvent: (dog: Dog) => dog.bark() };
    expect(() => bus.onEvent({ name: 'Tom' })).toThrow(new TypeError('dog.bark is not a function'));
  });

  it('Section 5: arrays are covariant, so writing through an Animal[] alias breaks the Dog[] it points to', () => {
    expect(linesAndCodes(`${ANIMALS}const dogs: Dog[] = [];\nexport const animals: Animal[] = dogs;`)).toEqual([]);
    const dogs: Dog[] = [];
    const animals: Animal[] = dogs;
    animals.push({ name: 'Tom' });
    expect(() => dogs[0]?.bark()).toThrow(TypeError);
  });

  it('Section 5: in/out annotations are checked (TS2636), and method parameters stay bivariant even under out', () => {
    expect(linesAndCodes('interface Producer<out T> { get(): T }\ninterface Consumer<in T> { accept: (value: T) => void }')).toEqual([]);
    expect(linesAndCodes('interface BadConsumer<in T> { get(): T }')).toEqual(['line 1: TS2636']);
    expect(linesAndCodes('interface BadProducer<out T> { set: (value: T) => void }')).toEqual(['line 1: TS2636']);
    expect(linesAndCodes('interface LooseProducer<out T> { set(value: T): void }')).toEqual([]);
  });

  it('Section 5: an out parameter lets Producer<Dog> stand in for Producer<Animal>, not the reverse (TS2322)', () => {
    const PRODUCERS = `${ANIMALS}interface Producer<out T> { get(): T }
declare const dogs: Producer<Dog>;
declare const animals: Producer<Animal>;
export const widened: Producer<Animal> = dogs;
export const narrowed: Producer<Dog> = animals;`;
    expect(linesAndCodes(PRODUCERS)).toEqual(['line 7: TS2322']);
  });
});
