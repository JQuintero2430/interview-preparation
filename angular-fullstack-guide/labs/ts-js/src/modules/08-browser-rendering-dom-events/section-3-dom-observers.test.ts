// @vitest-environment jsdom
// Section 3 (jsdom 30.1). IntersectionObserver and ResizeObserver are missing from jsdom; their claims are documentation.

describe('Module 08 · section 3', () => {
  it('Section 3: appending a DocumentFragment moves its children and leaves it empty', () => {
    const fragment = document.createDocumentFragment();
    for (const label of ['a', 'b', 'c']) fragment.append(Object.assign(document.createElement('li'), { textContent: label }));
    const list = document.createElement('ul');
    list.append(fragment);
    expect([list.children.length, fragment.childNodes.length]).toEqual([3, 0]);
  });

  it('Section 3: template.content is an inert fragment that cloneNode copies', () => {
    const template = document.createElement('template');
    template.innerHTML = '<li class="row"></li>';
    const clone = template.content.cloneNode(true) as DocumentFragment;
    expect([template.content instanceof DocumentFragment, clone.firstElementChild?.className, template.content.childNodes.length]).toEqual([
      true,
      'row',
      1,
    ]);
  });

  it('Section 3: MutationObserver delivers every record in one callback, after the synchronous code', async () => {
    const log: string[] = [];
    const host = document.createElement('div');
    new MutationObserver((records) => log.push(`callback with ${records.length} records`)).observe(host, { childList: true, attributes: true });
    host.append(document.createElement('span'));
    host.setAttribute('data-state', 'open');
    host.append(document.createElement('span'));
    log.push('sync done');
    await Promise.resolve();
    expect(log).toEqual(['sync done', 'callback with 3 records']);
  });

  it('Section 3: takeRecords() returns the pending records and empties the queue, so the callback does not run', async () => {
    let calls = 0;
    const host = document.createElement('div');
    const observer = new MutationObserver(() => calls++);
    observer.observe(host, { childList: true });
    host.append(document.createElement('span'));
    const pending = observer.takeRecords();
    observer.disconnect();
    await Promise.resolve();
    expect([pending.length, calls]).toEqual([1, 0]);
  });

  it('Section 3 (module 01 link): dataset entries and input values are strings, so an empty field converts to 0', () => {
    const input = Object.assign(document.createElement('input'), { type: 'number' });
    input.setAttribute('data-max', '5');
    expect([typeof input.dataset['max'], input.value, Number(input.value), input.valueAsNumber]).toEqual(['string', '', 0, NaN]);
  });

  it('Section 3: jsdom has no IntersectionObserver or ResizeObserver', () => {
    expect([typeof globalThis.IntersectionObserver, typeof globalThis.ResizeObserver]).toEqual(['undefined', 'undefined']);
  });
});
