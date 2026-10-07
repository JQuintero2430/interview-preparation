declare function log(line: string): void;

function tag(label: string) {
  log(`evaluate ${label}`);
  return function <This, Args extends unknown[], R>(
    method: (this: This, ...args: Args) => R,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => R>,
  ) {
    log(`apply ${label}`);
    context.addInitializer(() => log(`init ${label}`));
    return function (this: This, ...args: Args): R {
      log(`call ${label}`);
      return method.call(this, ...args);
    };
  };
}

class Report {
  @tag('A')
  @tag('B')
  print() {
    log('body');
  }
}

log('defined');
new Report().print();
