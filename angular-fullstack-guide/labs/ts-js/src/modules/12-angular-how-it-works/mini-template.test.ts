// @vitest-environment jsdom
// Exercise 12.4 tests: a model of instruction-based rendering (section 8), not Angular's runtime.
// DOM writes are counted by the view itself (`view.stats.writes`), not by spying on jsdom.
import { describe, expect, it } from 'vitest';
import { compile, createView, render, type Context } from './mini-template';

const CARD = compile(
  '<section class="card"><h2>{{ label }}: {{ count }}</h2><input [value]="label" /><button (click)="increment">+1</button></section>',
);

function mount(template = CARD): { host: HTMLElement; view: ReturnType<typeof createView> } {
  const host = document.createElement('div');
  return { host, view: createView(host, template) };
}

const noop = (): void => undefined;

describe('E12.4 · a miniature instruction-based template runtime (a model, not Angular)', () => {
  it('the first render creates the DOM once and fills bindings', () => {
    const { host, view } = mount();
    render(view, { label: 'Count', count: 0, increment: noop });
    const heading = host.querySelector('h2');

    expect(host.innerHTML).toBe('<section class="card"><h2>Count: 0</h2><input><button>+1</button></section>');
    expect(view.stats).toEqual({ createPasses: 1, updatePasses: 1, writes: 2 });
    expect([CARD.decls, CARD.vars]).toEqual([6, 3]);

    render(view, { label: 'Count', count: 1, increment: noop });
    expect(host.querySelector('h2')).toBe(heading);
    expect(host.querySelectorAll('h2')).toHaveLength(1);
  });

  it('a second render with unchanged context performs zero DOM writes', () => {
    const { view } = mount();
    render(view, { label: 'Count', count: 0, increment: noop });
    const before = view.stats.writes;

    render(view, { label: 'Count', count: 0, increment: noop }); // a new object with equal values
    expect(view.stats.writes - before).toBe(0);
  });

  it('changing one bound value writes exactly one node', () => {
    const { host, view } = mount();
    render(view, { label: 'Count', count: 0, increment: noop });
    const before = view.stats.writes;

    render(view, { label: 'Count', count: 1, increment: noop });
    expect(view.stats.writes - before).toBe(1);
    expect(host.querySelector('h2')?.textContent).toBe('Count: 1');

    render(view, { label: 'Total', count: 1, increment: noop }); // one name, two nodes: the text and the input
    expect(view.stats.writes - before).toBe(3);
  });

  it('property bindings set DOM properties, not attributes', () => {
    const { host, view } = mount(compile('<input [value]="name" />'));
    render(view, { name: 'Ada' });
    const input = host.querySelector('input');

    expect(input?.value).toBe('Ada');
    expect(input?.hasAttribute('value')).toBe(false);
  });

  it('event bindings call the context method with the event', () => {
    const { host, view } = mount();
    const calls: { context: Context; event: Event }[] = [];
    function increment(this: Context, event: Event): void {
      calls.push({ context: this, event });
    }
    const first = { label: 'Count', count: 0, increment };
    const latest = { label: 'Count', count: 1, increment };
    render(view, first);
    render(view, latest);

    const button = host.querySelector('button');
    button?.click();
    expect(calls).toHaveLength(1); // the create pass attached one listener, however many renders ran
    expect(calls[0]?.event.type).toBe('click');
    expect(calls[0]?.event.target).toBe(button);
    expect(calls[0]?.context).toBe(latest);
  });

  it('compile throws a clear error for an unclosed tag or an unknown binding syntax', () => {
    expect(() => compile('<p>Hello')).toThrow('Unclosed tag <p>');
    expect(() => compile('<p>Hello</div>')).toThrow('Unexpected </div> (open tag: <p>)');
    expect(() => compile('<p [(ngModel)]="name"></p>')).toThrow('Unknown binding syntax: [(ngModel)]="name"');
    expect(() => compile('<p [title]="a + b"></p>')).toThrow('Unknown binding syntax: [title]="a + b"');
    expect(() => compile('<p title="{{ name }}"></p>')).toThrow('Unknown binding syntax: title="{{ name }}"');
    expect(() => compile('<p>{{ a + b }}</p>')).toThrow('Unknown binding syntax: "a + b" in text');
  });

  it('the create pass runs once per view and the update pass on every render', () => {
    const first = mount();
    const second = mount();
    const ctx = { label: 'Count', count: 0, increment: noop };
    render(first.view, ctx);
    render(first.view, ctx);
    render(first.view, ctx);
    render(second.view, ctx);

    expect(first.view.stats).toMatchObject({ createPasses: 1, updatePasses: 3 });
    expect(second.view.stats).toMatchObject({ createPasses: 1, updatePasses: 1 });
    expect(second.host.innerHTML).toBe(first.host.innerHTML);
  });
});
