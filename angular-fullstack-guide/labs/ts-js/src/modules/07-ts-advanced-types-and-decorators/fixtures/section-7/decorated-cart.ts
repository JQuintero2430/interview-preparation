// Standard (TC39) decorators, compiled without experimentalDecorators. `report` is supplied by the test.
declare function report(line: string): void;

function trace(label: string) {
  report(`evaluate ${label}`);
  return function <This, Args extends unknown[], Result>(
    method: (this: This, ...args: Args) => Result,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Result>,
  ) {
    report(`apply ${label} to ${String(context.name)}`);
    context.addInitializer(function () {
      report(`initializer ${label}`);
    });
    return function (this: This, ...args: Args): Result {
      report(`call ${label}`);
      return method.call(this, ...args);
    };
  };
}

function observed<This, Value>(
  accessor: ClassAccessorDecoratorTarget<This, Value>,
  context: ClassAccessorDecoratorContext<This, Value>,
): ClassAccessorDecoratorResult<This, Value> {
  return {
    init(initial) {
      report(`init ${String(context.name)} = ${String(initial)}`);
      return initial;
    },
    set(value) {
      report(`set ${String(context.name)} = ${String(value)}`);
      accessor.set.call(this, value);
    },
  };
}

class Cart {
  @observed accessor count = 1;

  @trace('outer')
  @trace('inner')
  checkout(): number {
    report('checkout body');
    return this.count;
  }
}

report('class defined');
const cart = new Cart();
cart.count = 3;
report(`result ${cart.checkout()}`);
