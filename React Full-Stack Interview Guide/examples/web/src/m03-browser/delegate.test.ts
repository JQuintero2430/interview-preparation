import { delegate } from './delegate';

function get(selector: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) throw new Error(`missing ${selector}`);
  return el;
}

beforeEach(() => {
  document.body.innerHTML = `
    <section id="outside"><button id="out-btn">outside</button></section>
    <ul id="list">
      <li data-id="1"><span class="label">One</span></li>
      <li data-id="2">Two</li>
    </ul>`;
});
afterEach(() => document.body.replaceChildren());

test('one listener on the root serves clicks on nested children, passing the matched <li>', () => {
  const seen: string[] = [];
  delegate(get('#list'), 'click', 'li[data-id]', (_e, li) => seen.push(li.dataset.id ?? '?'));

  get('.label').click(); // target is the <span>; closest() finds its <li>
  get('li[data-id="2"]').click();

  expect(seen).toEqual(['1', '2']);
});

test('items added after registration are handled with no new listener', () => {
  const seen: string[] = [];
  delegate(get('#list'), 'click', 'li[data-id]', (_e, li) => seen.push(li.dataset.id ?? '?'));

  const li = document.createElement('li');
  li.dataset.id = '3';
  get('#list').append(li);
  li.click();

  expect(seen).toEqual(['3']);
});

test('clicks on the root itself or on non-matching descendants are ignored', () => {
  const handler = vi.fn();
  document.querySelector('#list')?.insertAdjacentHTML('beforeend', '<p id="note">note</p>');
  delegate(get('#list'), 'click', 'li[data-id]', handler);

  get('#list').click();
  get('#note').click();
  get('#out-btn').click();

  expect(handler).not.toHaveBeenCalled();
});

test('a match outside the root is rejected', () => {
  document.body.innerHTML = '<li data-id="x" id="wrap"><ul id="inner"><p id="p">p</p></ul></li>';
  const handler = vi.fn();
  delegate(get('#inner'), 'click', 'li[data-id]', handler);

  get('#p').click(); // closest() would find #wrap, which is an ancestor of the root

  expect(handler).not.toHaveBeenCalled();
});

test('the returned function removes the listener', () => {
  const handler = vi.fn();
  const off = delegate(get('#list'), 'click', 'li', handler);
  get('li[data-id="1"]').click();
  off();
  get('li[data-id="1"]').click();
  expect(handler).toHaveBeenCalledTimes(1);
});

test('a descendant that stops propagation hides the event from the delegated handler', () => {
  const handler = vi.fn();
  delegate(get('#list'), 'click', 'li', handler);
  get('.label').addEventListener('click', (e) => e.stopPropagation());

  get('.label').click();

  expect(handler).not.toHaveBeenCalled();
});

test('non-bubbling events (focus) never reach the root, focusin does', () => {
  document.querySelector('#list')?.insertAdjacentHTML('beforeend', '<li><input id="field"></li>');
  const onFocus = vi.fn();
  const onFocusIn = vi.fn();
  delegate(get('#list'), 'focus', 'li', onFocus);
  delegate(get('#list'), 'focusin', 'li', onFocusIn);

  get('#field').focus();

  expect(onFocus).not.toHaveBeenCalled();
  expect(onFocusIn).toHaveBeenCalledTimes(1);
});
