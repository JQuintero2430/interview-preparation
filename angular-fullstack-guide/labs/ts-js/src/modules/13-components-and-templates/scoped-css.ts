// Exercise 13.5: a model of the observed behavior of Angular 22.2.1's emulated-encapsulation CSS rewriter
// (the private ShadowCss), not its implementation. Not covered: nested CSS, comments, @import and other
// statement at-rules, escapes and strings holding braces, :is()/:where() arguments, keyframes inside at-rule blocks.

interface Scope {
  readonly content: string; // [_ngcontent-<id>]
  readonly host: string; // [_nghost-<id>]
  readonly keyframePrefix: string; // _ngcontent-<id>_
  readonly keyframes: ReadonlySet<string>;
}

interface Block {
  readonly prelude: string;
  readonly body: string;
  readonly rest: string;
}

type BlockRule = (prelude: string, body: string, scope: Scope) => string;

const KEYFRAMES_PRELUDE = /^(@(?:-webkit-)?keyframes\s+)(\S+)$/;
const NESTING_AT_RULE = /^@(?:media|layer|container)\b/;
const HOST = /^:host(?:\(([^()]*)\))?((?::.*)?)$/;
const HOST_CONTEXT = /^:host-context\(([^()]*)\)\s*(.*)$/;
const COMBINATOR = /^[>+~]$/;
const ANIMATION_DECLARATION = /(animation(?:-name)?\s*:)([^;}]*)/g;
const DEPTH_STEP: Readonly<Record<string, number>> = { '{': 1, '}': -1, '(': 1, ')': -1, '[': 1, ']': -1 };
const BEFORE_FIRST_PSEUDO = /^(?:[^:[]|\[[^\]]*\])*/;

// The table of rules: the first matching prelude decides what happens to its block.
const BLOCK_RULES: ReadonlyArray<readonly [RegExp, BlockRule]> = [
  [KEYFRAMES_PRELUDE, (prelude, body, scope) => `${renameKeyframes(prelude, scope)} { ${body.trim()} }`],
  [NESTING_AT_RULE, (prelude, body, scope) => `${prelude} { ${scopeBlocks(body, scope)} }`],
  [/^@/, (prelude, body) => `${prelude} { ${body.trim()} }`],
  [/./, (prelude, body, scope) => `${scopeSelectorList(prelude, scope)} { ${body.trim()} }`],
];

export function scopeCss(css: string, id: string): string {
  const scope: Scope = {
    content: `[_ngcontent-${id}]`,
    host: `[_nghost-${id}]`,
    keyframePrefix: `_ngcontent-${id}_`,
    keyframes: new Set([...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((match) => match[1] ?? '')),
  };
  return scopeBlocks(renameAnimations(css, scope), scope);
}

function renameAnimations(css: string, scope: Scope): string {
  const rename = (word: string): string => (scope.keyframes.has(word) ? scope.keyframePrefix + word : word);
  return css.replace(ANIMATION_DECLARATION, (_, head: string, value: string) => head + value.replace(/[\w-]+/g, rename));
}

function renameKeyframes(prelude: string, scope: Scope): string {
  return prelude.replace(KEYFRAMES_PRELUDE, (_, start: string, name: string) => start + scope.keyframePrefix + name);
}

function scopeBlocks(css: string, scope: Scope): string {
  const out: string[] = [];
  let rest = css.trim();
  while (rest.includes('{')) {
    const block = nextBlock(rest);
    const [, apply] = BLOCK_RULES.find(([test]) => test.test(block.prelude))!;
    out.push(apply(block.prelude, block.body, scope));
    rest = block.rest;
  }
  return out.join(' ');
}

function nextBlock(css: string): Block {
  const open = css.indexOf('{');
  let depth = 0;
  let close = css.length - 1;
  for (let i = open; i < css.length; i += 1) {
    depth += DEPTH_STEP[css.charAt(i)] ?? 0;
    if (depth === 0) {
      close = i;
      break;
    }
  }
  return { prelude: css.slice(0, open).trim(), body: css.slice(open + 1, close), rest: css.slice(close + 1).trim() };
}

function scopeSelectorList(list: string, scope: Scope): string {
  return splitTop(list, /,/)
    .filter((piece) => piece !== ',')
    .flatMap((selector) => scopeSelector(selector.trim(), scope))
    .join(', ');
}

function scopeSelector(selector: string, scope: Scope): string[] {
  const deepAt = selector.indexOf('::ng-deep'); // everything from here on stays global
  const head = deepAt < 0 ? selector : selector.slice(0, deepAt);
  const tail = deepAt < 0 ? '' : selector.slice(deepAt + '::ng-deep'.length);
  return scopeHead(head.trim(), scope).map((scoped) => joinParts(scoped, tail.trim()));
}

function scopeHead(head: string, scope: Scope): string[] {
  const context = HOST_CONTEXT.exec(head);
  if (!context) {
    return [scopeCompounds(head, scope)];
  }
  const ancestor = context[1] ?? '';
  const scopedRest = scopeCompounds(context[2] ?? '', scope);
  // the ancestor may be the host itself or sit above it, hence two selectors
  return [joinParts(`${ancestor}${scope.host}`, scopedRest), joinParts(`${ancestor} ${scope.host}`, scopedRest)];
}

function scopeCompounds(text: string, scope: Scope): string {
  return splitTop(text, /[\s>+~]/)
    .filter((piece) => piece.trim() !== '')
    .map((piece) => (COMBINATOR.test(piece) ? piece : scopeCompound(piece, scope)))
    .join(' ');
}

function scopeCompound(compound: string, scope: Scope): string {
  const host = HOST.exec(compound);
  if (host && !host[1]?.includes(',')) {
    return `${host[1] ?? ''}${scope.host}${host[2]}`;
  }
  const at = BEFORE_FIRST_PSEUDO.exec(compound)![0].length; // pseudo-classes and -elements stay after the attribute
  return compound.slice(0, at) + scope.content + compound.slice(at);
}

function joinParts(...parts: string[]): string {
  return parts.filter((part) => part !== '').join(' ');
}

// Splits at separators outside (...) and [...]; separators other than whitespace come back as pieces of their own.
function splitTop(text: string, separator: RegExp): string[] {
  const pieces: string[] = [];
  let current = '';
  let depth = 0;
  for (const char of text) {
    depth += DEPTH_STEP[char] ?? 0;
    if (depth === 0 && separator.test(char)) {
      pieces.push(current, ...(/\s/.test(char) ? [] : [char]));
      current = '';
    } else {
      current += char;
    }
  }
  return [...pieces, current];
}
