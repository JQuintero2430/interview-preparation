// Exercise 13.4: a model of the template-expression subset (module 13, sections 2 and 3).
// A model, not Angular's parser: no pipes, arrow functions, regular expressions, tagged templates, spread, array or object literals.
export type Context = Record<string, unknown>;

export type ExpressionErrorKind =
  | 'assignment'
  | 'increment'
  | 'new'
  | 'bitwise'
  | 'comma'
  | 'chain'
  | 'declaration'
  | 'global'
  | 'unary-before-exponent';

export interface EvaluateOptions {
  /** The pre-v22 result of a nullish `?.` chain: `null` instead of `undefined`. */
  readonly legacySafeNavigation?: boolean;
}

export class ExpressionError extends Error {
  readonly kind: ExpressionErrorKind;

  constructor(kind: ExpressionErrorKind, message: string) {
    super(message);
    this.name = 'ExpressionError';
    this.kind = kind;
  }
}

type Evaluator = (context: Context) => unknown;
type Apply = (left: unknown, right: () => unknown) => unknown;

interface Token {
  readonly type: 'num' | 'str' | 'tpl' | 'id' | 'op' | 'end';
  readonly text: string;
}

// Tokens the template parser refuses, keyed by the lexeme and mapped to the error kind of the dated `ngc` 22.2.1 run (2026-10-07).
const REJECTED = new Map<string, ExpressionErrorKind>([
  ...['=', '+=', '-=', '*=', '/=', '%='].map((text): [string, ExpressionErrorKind] => [text, 'assignment']),
  ...['++', '--'].map((text): [string, ExpressionErrorKind] => [text, 'increment']),
  ...['&', '|', '^', '~', '<<', '>>'].map((text): [string, ExpressionErrorKind] => [text, 'bitwise']),
  ...['let', 'var', 'const'].map((text): [string, ExpressionErrorKind] => [text, 'declaration']),
  ['new', 'new'],
  [',', 'comma'],
  [';', 'chain'],
]);

// Angular exposes no JavaScript globals, so reading one of these from the context is the `TS2339` of the run.
const GLOBALS = new Set(['Math', 'Number', 'String', 'Boolean', 'Date', 'JSON', 'Object', 'Array', 'Promise']);
const LITERALS = new Map<string, unknown>([['true', true], ['false', false], ['null', null], ['undefined', undefined]]);

const num = (f: (a: number, b: number) => unknown): Apply => (l, r) => f(l as number, r() as number);
const strict = (f: (a: unknown, b: unknown) => unknown): Apply => (l, r) => f(l, r());

// One table: binding power and meaning. `right` is a thunk so that `&&`, `||` and `??` can skip it.
const BINARY = new Map<string, { prec: number; apply: Apply }>([
  ['??', { prec: 1, apply: (l, r) => (l ?? r()) }],
  ['||', { prec: 2, apply: (l, r) => (l || r()) }],
  ['&&', { prec: 3, apply: (l, r) => (l && r()) }],
  ['==', { prec: 4, apply: strict((a, b) => a == b) }],
  ['!=', { prec: 4, apply: strict((a, b) => a != b) }],
  ['===', { prec: 4, apply: strict((a, b) => a === b) }],
  ['!==', { prec: 4, apply: strict((a, b) => a !== b) }],
  ['<', { prec: 5, apply: num((a, b) => a < b) }],
  ['>', { prec: 5, apply: num((a, b) => a > b) }],
  ['<=', { prec: 5, apply: num((a, b) => a <= b) }],
  ['>=', { prec: 5, apply: num((a, b) => a >= b) }],
  ['in', { prec: 5, apply: strict((a, b) => (a as string) in (b as object)) }],
  ['+', { prec: 6, apply: num((a, b) => a + b) }],
  ['-', { prec: 6, apply: num((a, b) => a - b) }],
  ['*', { prec: 7, apply: num((a, b) => a * b) }],
  ['/', { prec: 7, apply: num((a, b) => a / b) }],
  ['%', { prec: 7, apply: num((a, b) => a % b) }],
]);

const UNARY = new Map<string, (value: unknown) => unknown>([
  ['!', (v) => !v],
  ['-', (v) => -(v as number)],
  ['+', (v) => +(v as number)],
  ['typeof', (v) => typeof v],
  ['void', () => undefined],
]);

const TOKEN = new RegExp(
  '\\s*(?:(?<num>\\d+(?:\\.\\d+)?)|(?<str>\'[^\']*\'|"[^"]*")|(?<tpl>`[^`]*`)|(?<id>[A-Za-z_$][\\w$]*)' +
    '|(?<op>\\*\\*|===|!==|==|!=|<=|>=|<<|>>|&&|\\|\\||\\?\\?|\\?\\.(?!\\d)|\\+\\+|--|[-+*/%]=|[-+*/%<>!?:.,;()[\\]=&|^~]))',
  'y',
);

function tokenize(source: string): Token[] {
  const text = source.trimEnd();
  const tokens: Token[] = [];
  TOKEN.lastIndex = 0;
  while (TOKEN.lastIndex < text.length) {
    const found = TOKEN.exec(text);
    const entry = Object.entries(found?.groups ?? {}).find(([, lexeme]) => lexeme !== undefined);
    if (!entry) {
      throw new SyntaxError(`Unexpected character at column ${TOKEN.lastIndex} in [ ${source} ]`);
    }
    tokens.push({ type: entry[0] as Token['type'], text: entry[1] as string });
  }
  return tokens;
}

interface Step {
  readonly optional: boolean;
  apply(current: unknown, receiver: unknown, context: Context): unknown;
}

// Walk a member/key/call chain; an optional step on a nullish value ends the whole chain with `miss`.
function runChain(head: unknown, steps: Step[], context: Context, miss: unknown): unknown {
  let value = head;
  let receiver: unknown = context;
  for (const step of steps) {
    if (step.optional && value == null) {
      return miss;
    }
    const next = step.apply(value, receiver, context);
    receiver = value;
    value = next;
  }
  return value;
}

function readName(context: Context, name: string): unknown {
  if (Object.hasOwn(context, name)) {
    return context[name];
  }
  if (GLOBALS.has(name)) {
    throw new ExpressionError('global', `Property '${name}' does not exist on the component: templates have no globals`);
  }
  return undefined;
}

class Parser {
  private position = 0;
  private readonly tokens: Token[];
  private readonly miss: unknown;

  constructor(source: string, options: EvaluateOptions) {
    this.tokens = tokenize(source);
    this.miss = options.legacySafeNavigation ? null : undefined;
  }

  parse(): Evaluator {
    const expression = this.ternary();
    if (this.peek().type !== 'end') {
      this.unexpected(this.peek());
    }
    return expression;
  }

  private peek(): Token {
    return this.tokens[this.position] ?? { type: 'end', text: '' };
  }

  private at(text: string): boolean {
    const token = this.peek();
    return token.type !== 'end' && token.text === text;
  }

  private eat(text: string): boolean {
    const found = this.at(text);
    this.position += found ? 1 : 0;
    return found;
  }

  private expect(text: string): void {
    if (!this.eat(text)) {
      this.unexpected(this.peek());
    }
  }

  private unexpected(token: Token): never {
    const kind = REJECTED.get(token.text);
    const message = `Unexpected ${token.type === 'end' ? 'end of expression' : `token ${token.text}`}`;
    throw kind ? new ExpressionError(kind, message) : new SyntaxError(message);
  }

  private ternary(): Evaluator {
    const test = this.binary(1);
    if (!this.eat('?')) {
      return test;
    }
    const whenTrue = this.ternary();
    this.expect(':');
    const whenFalse = this.ternary();
    return (context) => (test(context) ? whenTrue(context) : whenFalse(context));
  }

  private binary(min: number): Evaluator {
    let left = this.unary();
    for (;;) {
      const entry = BINARY.get(this.peek().text);
      if (!entry || entry.prec < min) {
        return left;
      }
      this.position += 1;
      const lhs = left;
      const rhs = this.binary(entry.prec + 1);
      left = (context) => entry.apply(lhs(context), () => rhs(context));
    }
  }

  private unary(): Evaluator {
    const apply = UNARY.get(this.peek().text);
    if (!apply) {
      return this.power();
    }
    this.position += 1;
    const operand = UNARY.has(this.peek().text) ? this.unary() : this.postfix();
    if (this.at('**')) {
      throw new ExpressionError('unary-before-exponent', 'A unary operator before ** needs parentheses');
    }
    return (context) => apply(operand(context));
  }

  private power(): Evaluator {
    const base = this.postfix();
    if (!this.eat('**')) {
      return base;
    }
    const exponent = this.unary(); // recursion on the right side makes ** right associative
    return (context) => (base(context) as number) ** (exponent(context) as number);
  }

  private postfix(): Evaluator {
    const head = this.primary();
    const steps: Step[] = [];
    for (let step = this.step(); step; step = this.step()) {
      steps.push(step);
    }
    return steps.length === 0 ? head : (context) => runChain(head(context), steps, context, this.miss);
  }

  private step(): Step | undefined {
    const optional = this.eat('?.');
    if (this.eat('.') || (optional && this.peek().type === 'id')) {
      const name = this.next().text;
      return { optional, apply: (current) => (current as Context)[name] };
    }
    if (this.eat('[')) {
      const key = this.ternary();
      this.expect(']');
      return { optional, apply: (current, _receiver, context) => (current as Context)[key(context) as string] };
    }
    if (this.eat('(')) {
      const args = this.args();
      return { optional, apply: (current, receiver, context) => (current as (...values: unknown[]) => unknown).apply(receiver, args.map((a) => a(context))) };
    }
    return optional ? this.unexpected(this.peek()) : undefined;
  }

  private args(): Evaluator[] {
    const args: Evaluator[] = [];
    while (!this.at(')')) {
      args.push(this.ternary());
      if (!this.eat(',')) {
        break;
      }
    }
    this.expect(')');
    return args;
  }

  private next(): Token {
    const token = this.peek();
    this.position += 1;
    return token;
  }

  private primary(): Evaluator {
    const token = this.next();
    switch (token.type) {
      case 'num':
        return () => Number(token.text);
      case 'str':
        return () => token.text.slice(1, -1);
      case 'tpl':
        return templateOf(token.text.slice(1, -1), this.miss === null);
      case 'id':
        return this.word(token);
      default:
        return this.group(token);
    }
  }

  private group(token: Token): Evaluator {
    if (token.text !== '(') {
      return this.unexpected(token);
    }
    const inner = this.ternary();
    this.expect(')');
    return inner;
  }

  private word(token: Token): Evaluator {
    if (LITERALS.has(token.text)) {
      const value = LITERALS.get(token.text);
      return () => value;
    }
    if (REJECTED.has(token.text)) {
      return this.unexpected(token);
    }
    return token.text === 'this' ? (context) => context : (context) => readName(context, token.text);
  }
}

// `${…}` sources sit at the odd positions of the split; this model allows no braces inside them.
function templateOf(raw: string, legacySafeNavigation: boolean): Evaluator {
  const parts = raw.split(/\$\{([^{}]*)\}/).map((piece, index) => (index % 2 ? compile(piece, { legacySafeNavigation }) : piece));
  return (context) => parts.map((part) => (typeof part === 'string' ? part : String(part(context)))).join('');
}

function compile(source: string, options: EvaluateOptions): Evaluator {
  return new Parser(source, options).parse();
}

export function evaluate(source: string, context: Context, options: EvaluateOptions = {}): unknown {
  return compile(source, options)(context);
}

export function renderInterpolation(text: string, context: Context): string {
  return text.replace(/\{\{([\s\S]*?)\}\}/g, (_match, source: string) => {
    const value = evaluate(source, context);
    return value == null ? '' : String(value);
  });
}
