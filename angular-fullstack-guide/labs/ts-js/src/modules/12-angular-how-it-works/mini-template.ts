// Exercise 12.4: a model of instruction-based rendering (module 12, section 8), not Angular's runtime or compiler.
// The instruction names (elementStart, text, listener, property, textInterpolate) only echo the ones `ngc` emits.
// Syntax: elements (void ones written `<input />`), static text and attributes, `{{ name }}`, `[prop]="name"` and
// `(event)="method"`. Not covered: expressions beyond identifiers, control flow, pipes, components, sanitization.

export type RenderFlags = 1 | 2;
export type Context = Readonly<Record<string, unknown>>;
export type TemplateFunction = (rf: RenderFlags, ctx: Context, view: View) => void;

// Like `decls` and `vars` in ɵcmp: how many node slots and binding slots a view of this template needs.
export type CompiledTemplate = TemplateFunction & { readonly decls: number; readonly vars: number };

export interface ViewStats {
  createPasses: number;
  updatePasses: number;
  writes: number; // DOM writes made by update passes
}

export interface View {
  readonly host: Element;
  readonly template: CompiledTemplate;
  readonly slots: Node[];
  readonly bindings: unknown[];
  readonly parents: Node[];
  readonly stats: ViewStats;
  context: Context;
}

type Instruction = (view: View) => void;

type Token =
  | { readonly kind: 'open'; readonly tag: string; readonly attributes: string; readonly selfClosing: boolean }
  | { readonly kind: 'close'; readonly tag: string }
  | { readonly kind: 'text'; readonly value: string };

interface Attribute {
  readonly kind: 'static' | 'property' | 'listener';
  readonly name: string;
  readonly value: string;
}

interface Program {
  readonly create: Instruction[];
  readonly update: Instruction[];
  readonly open: string[];
  slots: number;
  bindings: number;
}

const TOKEN = /<\/([a-z][\w-]*)\s*>|<([a-z][\w-]*)((?:\s+[^\s"'=<>/]+(?:="[^"]*")?)*)\s*(\/?)>|([^<]+)/y;
const ATTRIBUTE = /([^\s=]+)(?:="([^"]*)")?/g;
const INTERPOLATION = /\{\{([^{}]*)\}\}/;
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
const BRACES = /\{\{|\}\}/;
const ERROR_CONTEXT_LENGTH = 20;
// Like RenderFlags.Create and RenderFlags.Update in Angular's runtime.
const CREATE = 1;
const UPDATE = 2;
const ATTRIBUTE_FORMS = [
  { kind: 'property', pattern: /^\[([A-Za-z]\w*)\]$/ },
  { kind: 'listener', pattern: /^\(([a-z][\w-]*)\)$/ },
  { kind: 'static', pattern: /^([A-Za-z][\w-]*)$/ },
] as const;
const NO_VALUE = Symbol('no value'); // a fresh binding slot equals no value, so the first update pass writes every binding

/**
 * Compiles a template once into a template function: the create pass builds nodes into slots, the update pass writes
 * changed bindings. Throws a SyntaxError for an unclosed or mismatched tag and for any binding form this model does not read.
 */
export function compile(template: string): CompiledTemplate {
  const program: Program = { create: [], update: [], open: [], slots: 0, bindings: 0 };
  for (const token of tokenize(template)) {
    compileToken(program, token);
  }
  const unclosed = program.open.at(-1);
  if (unclosed !== undefined) {
    throw new SyntaxError(`Unclosed tag <${unclosed}>`);
  }
  const passes = { [CREATE]: program.create, [UPDATE]: program.update };
  const run: TemplateFunction = (rf, ctx, view) => {
    view.context = ctx;
    passes[rf].forEach((instruction) => instruction(view));
    view.stats[rf === CREATE ? 'createPasses' : 'updatePasses'] += 1;
  };
  return Object.assign(run, { decls: program.slots, vars: program.bindings });
}

/** Creates an empty view of `template` that renders into `host`: `decls` node slots and `vars` binding slots. */
export function createView(host: Element, template: CompiledTemplate): View {
  return {
    host,
    template,
    slots: new Array<Node>(template.decls),
    bindings: new Array<unknown>(template.vars).fill(NO_VALUE),
    parents: [host],
    stats: { createPasses: 0, updatePasses: 0, writes: 0 },
    context: {},
  };
}

/** Renders `ctx` into `view`: the first render runs the create pass, then the update pass; every later one only the update pass. */
export function render(view: View, ctx: Context): void {
  if (view.stats.createPasses === 0) {
    view.template(CREATE, ctx, view);
  }
  view.template(UPDATE, ctx, view);
}

function tokenize(template: string): Token[] {
  const pattern = new RegExp(TOKEN);
  const tokens: Token[] = [];
  while (pattern.lastIndex < template.length) {
    const at = pattern.lastIndex;
    const match = pattern.exec(template);
    if (match === null) {
      throw new SyntaxError(`Cannot read the template at position ${at}: "${template.slice(at, at + ERROR_CONTEXT_LENGTH)}"`);
    }
    tokens.push(toToken(match));
  }
  return tokens;
}

function toToken([, closeTag, openTag, attributes = '', slash, text = '']: RegExpExecArray): Token {
  if (closeTag !== undefined) {
    return { kind: 'close', tag: closeTag };
  }
  if (openTag !== undefined) {
    return { kind: 'open', tag: openTag, attributes, selfClosing: slash === '/' };
  }
  return { kind: 'text', value: text };
}

function compileToken(program: Program, token: Token): void {
  switch (token.kind) {
    case 'open':
      return compileElement(program, token.tag, token.attributes, token.selfClosing);
    case 'close':
      return compileClose(program, token.tag);
    case 'text':
      return compileText(program, token.value);
  }
}

function compileElement(program: Program, tag: string, source: string, selfClosing: boolean): void {
  const slot = program.slots++;
  const attributes = [...source.matchAll(ATTRIBUTE)].map(([, name = '', value]) => classify(name, value));
  const ofKind = (kind: Attribute['kind']) => attributes.filter((attribute) => attribute.kind === kind);
  program.create.push(elementStart(slot, tag, ofKind('static')));
  ofKind('listener').forEach(({ name, value }) => program.create.push(listener(slot, name, value)));
  ofKind('property').forEach(({ name, value }) => program.update.push(property(slot, program.bindings++, name, value)));
  if (selfClosing) {
    program.create.push(elementEnd());
  } else {
    program.open.push(tag);
  }
}

function classify(raw: string, value = ''): Attribute {
  for (const { kind, pattern } of ATTRIBUTE_FORMS) {
    const name = pattern.exec(raw)?.[1];
    if (name !== undefined && (kind === 'static' ? !BRACES.test(value) : IDENTIFIER.test(value))) {
      return { kind, name, value };
    }
  }
  throw new SyntaxError(
    `Unknown binding syntax: ${raw}="${value}" (this model reads [prop]="name", (event)="method" and plain attributes)`,
  );
}

function compileClose(program: Program, tag: string): void {
  const expected = program.open.pop();
  if (expected !== tag) {
    throw new SyntaxError(`Unexpected </${tag}> (open tag: ${expected === undefined ? 'none' : `<${expected}>`})`);
  }
  program.create.push(elementEnd());
}

// Split on {{ }}: even indexes are static strings, odd indexes the names they interpolate.
function compileText(program: Program, value: string): void {
  if (value.trim() === '') {
    return; // this model drops whitespace-only text between tags
  }
  const parts = value.split(new RegExp(INTERPOLATION, 'g'));
  const statics = parts.filter((_, index) => index % 2 === 0);
  const names = parts.filter((_, index) => index % 2 === 1).map((name) => name.trim());
  const unreadable = [...statics.filter((part) => BRACES.test(part)), ...names.filter((name) => !IDENTIFIER.test(name))];
  if (unreadable.length > 0) {
    throw new SyntaxError(`Unknown binding syntax: "${unreadable[0]}" in text "${value.trim()}"`);
  }
  const slot = program.slots++;
  program.create.push(text(slot, names.length === 0 ? value : ''));
  if (names.length > 0) {
    program.update.push(textInterpolate(slot, program.bindings, statics, names));
    program.bindings += names.length;
  }
}

function elementStart(slot: number, tag: string, statics: readonly Attribute[]): Instruction {
  return (view) => {
    const element = view.host.ownerDocument.createElement(tag);
    statics.forEach(({ name, value }) => element.setAttribute(name, value));
    append(view, slot, element);
    view.parents.push(element);
  };
}

function elementEnd(): Instruction {
  return (view) => {
    view.parents.pop();
  };
}

function text(slot: number, value: string): Instruction {
  return (view) => append(view, slot, view.host.ownerDocument.createTextNode(value));
}

// Attached once by the create pass; it calls the method of the context of the latest render.
function listener(slot: number, event: string, method: string): Instruction {
  return (view) => view.slots[slot]?.addEventListener(event, (domEvent) => call(view.context, method, domEvent));
}

function property(slot: number, binding: number, name: string, key: string): Instruction {
  return (view) => {
    const value = view.context[key];
    if (bindingUpdated(view, binding, value)) {
      Reflect.set(view.slots[slot] as Node, name, value);
      view.stats.writes += 1;
    }
  };
}

function textInterpolate(slot: number, firstBinding: number, statics: readonly string[], names: readonly string[]): Instruction {
  return (view) => {
    const values = names.map((name) => view.context[name]);
    // map, not some: every binding slot must store its new value, even after the first change is found
    const changed = values.map((value, index) => bindingUpdated(view, firstBinding + index, value)).includes(true);
    if (changed) {
      (view.slots[slot] as Text).data = statics.map((part, index) => part + String(values[index] ?? '')).join('');
      view.stats.writes += 1;
    }
  };
}

function bindingUpdated(view: View, binding: number, value: unknown): boolean {
  if (Object.is(view.bindings[binding], value)) {
    return false;
  }
  view.bindings[binding] = value;
  return true;
}

function append(view: View, slot: number, node: Node): void {
  view.parents.at(-1)?.appendChild(node);
  view.slots[slot] = node;
}

function call(context: Context, method: string, event: Event): void {
  const handler = context[method];
  if (typeof handler !== 'function') {
    throw new TypeError(`The context has no method "${method}"`);
  }
  handler.call(context, event);
}
