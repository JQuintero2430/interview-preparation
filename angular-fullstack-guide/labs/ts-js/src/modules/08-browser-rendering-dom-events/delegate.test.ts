// @vitest-environment jsdom
import { delegate } from './delegate';

/** Builds a list inside a matching wrapper, so a match outside the root exists. */
const setup = () => {
  document.body.innerHTML = '<div class="row" id="outside"><ul><li class="row" data-id="1"><button><span>Open</span></button></li></ul></div>';
  const list = document.querySelector('ul')!;
  const calls: string[] = [];
  const stop = delegate(list, 'click', '.row', (event, matched) => calls.push(`${event.type} ${matched.id || (matched as HTMLElement).dataset['id']}`));
  return { list, calls, stop };
};
const click = (element: Element) => element.dispatchEvent(new MouseEvent('click', { bubbles: true }));

describe('E08.1 delegate', () => {
  it('a click on a descendant of a matching element calls the handler with that element', () => {
    const { calls } = setup();
    click(document.querySelector('span')!);
    expect(calls).toEqual(['click 1']);
  });

  it('clicks that match nothing inside root are ignored', () => {
    const { list, calls } = setup();
    const empty = document.createElement('p');
    list.append(empty);
    click(empty);
    click(list);
    expect(calls).toEqual([]);
  });

  it('elements added after the call are handled', () => {
    const { list, calls } = setup();
    const late = Object.assign(document.createElement('li'), { className: 'row' });
    late.dataset['id'] = '2';
    list.append(late);
    click(late);
    expect(calls).toEqual(['click 2']);
  });

  it('a matching ancestor outside root does not count', () => {
    const { list, calls } = setup();
    const unmatched = document.createElement('em');
    list.append(unmatched);
    click(unmatched);
    expect(calls).toEqual([]);
    expect(unmatched.closest('.row')?.id).toBe('outside');
  });

  it('the returned function removes the listener', () => {
    const { calls, stop } = setup();
    stop();
    click(document.querySelector('span')!);
    expect(calls).toEqual([]);
  });
});
