type Cat = { meow(): string };
type Dog = { bark(): string };

export function describe(value: string[] | number | null): number {
  if (typeof value === 'object') {
    return value.length;
  }
  if (value) {
    return value.toFixed().length;
  }
  return 0;
}

export function speak(pet: Cat | Dog | null): string {
  if (pet && 'meow' in pet) {
    return pet.meow();
  }
  return pet.bark();
}
