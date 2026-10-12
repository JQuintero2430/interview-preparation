// Exercise 10.1: a model of Selectors Level 4 section 15 (specificity), not a browser and not a selector parser.
// Not modelled: nesting `&`, `@scope`, escapes, namespaces, `:nth-child(... of S)`, single-colon pseudo-elements, `]` or `)` inside values.

/** Counts of [id selectors, class/attribute/pseudo-class selectors, type selectors/pseudo-elements]. */
export type Specificity = readonly [ids: number, classes: number, types: number];

const ZERO: Specificity = [0, 0, 0];

// Anchored patterns tried in order at each position: `::` before `:`, and combinators and `*` weigh nothing.
const SIMPLE: ReadonlyArray<readonly [RegExp, Specificity]> = [
  [/^#[\w-]+/, [1, 0, 0]],
  [/^\.[\w-]+/, [0, 1, 0]],
  [/^\[[^\]]*\]/, [0, 1, 0]],
  [/^::[\w-]+/, [0, 0, 1]],
  [/^:[\w-]+/, [0, 1, 0]],
  [/^[a-zA-Z][\w-]*/, [0, 0, 1]],
  [/^[\s*>+~]+/, ZERO],
];
const FUNCTIONAL = /^:([\w-]+)\(/;

const add = (x: Specificity, y: Specificity): Specificity => [x[0] + y[0], x[1] + y[1], x[2] + y[2]];

/** Columns compare left to right: a positive number when `a` outranks `b`, negative when `b` does, 0 on a tie. */
export const compareSpecificity = (a: Specificity, b: Specificity): number => Math.sign(a.map((count, column) => count - b[column]!).find((difference) => difference !== 0) ?? 0);

const mostSpecific = (list: readonly Specificity[]): Specificity => list.reduce((best, next) => (compareSpecificity(next, best) > 0 ? next : best), ZERO);

/** Index of the `)` that closes the `(` at `open`. */
function closingParen(text: string, open: number): number {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    depth += text[i] === '(' ? 1 : text[i] === ')' ? -1 : 0;
    if (depth === 0) return i;
  }
  throw new SyntaxError(`Unclosed "(" at ${open}`);
}

/** Splits a selector list at the commas that are not inside parentheses or brackets. */
function splitList(list: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < list.length; i++) {
    const char = list[i]!;
    depth += '(['.includes(char) ? 1 : ')]'.includes(char) ? -1 : 0;
    if (char === ',' && depth === 0) {
      parts.push(list.slice(start, i));
      start = i + 1;
    }
  }
  return [...parts, list.slice(start)];
}

function functionalWeight(name: string, args: string): Specificity {
  if (name === 'where') return ZERO;
  if (name === 'is' || name === 'not' || name === 'has') return mostSpecific(splitList(args).map(specificity));
  return [0, 1, 0]; // any other functional pseudo-class counts as one pseudo-class
}

function readPart(selector: string, at: number): { weight: Specificity; end: number } {
  const rest = selector.slice(at);
  const functional = FUNCTIONAL.exec(rest);
  if (functional) {
    const close = closingParen(selector, at + functional[0].length - 1);
    return { weight: functionalWeight(functional[1]!, selector.slice(at + functional[0].length, close)), end: close + 1 };
  }
  for (const [pattern, weight] of SIMPLE) {
    const match = pattern.exec(rest);
    if (match) return { weight, end: at + match[0].length };
  }
  throw new SyntaxError(`Unsupported selector text at ${at}: "${rest.slice(0, 10)}"`);
}

/** The specificity of one complex selector. */
export function specificity(selector: string): Specificity {
  let total = ZERO;
  for (let at = 0; at < selector.length; ) {
    const { weight, end } = readPart(selector, at);
    total = add(total, weight);
    at = end;
  }
  return total;
}
