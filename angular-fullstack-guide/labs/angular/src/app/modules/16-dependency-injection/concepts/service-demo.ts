import { inject, Injectable, InjectionToken, Service } from '@angular/core';

// Counts constructions so a test asserts how many instances were made.
export const built = { shopping: 0, legacy: 0, optIn: 0, greeter: 0, stamp: 0 };

// A root singleton written both ways: the shorthand and the long form.
@Service()
export class Shopping {
  constructor() {
    built.shopping++;
  }
}

@Injectable({ providedIn: 'root' })
export class LegacyShopping {
  constructor() {
    built.legacy++;
  }
}

// Not registered anywhere until a `providers` array lists it.
@Service({ autoProvided: false })
export class OptIn {
  constructor() {
    built.optIn++;
  }
}

// A token with a default value, read by the factory below.
export const SALUTATION = new InjectionToken<string>('lab-s3-salutation', {
  providedIn: 'root',
  factory: () => 'hello',
});

// A factory builds the instance and may call inject(); the class is abstract, so only the factory can build it.
@Service({ factory: () => new Polite(inject(SALUTATION)) })
export abstract class Greeter {
  abstract greet(): string;
}

class Polite extends Greeter {
  constructor(private readonly salutation: string) {
    super();
    built.greeter++;
  }

  greet(): string {
    return this.salutation;
  }
}

// Provided in the platform injector, above the root.
@Injectable({ providedIn: 'platform' })
export class PlatformStamp {
  constructor() {
    built.stamp++;
  }
}
