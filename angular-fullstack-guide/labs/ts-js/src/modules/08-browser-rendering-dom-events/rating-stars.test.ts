// @vitest-environment jsdom
import { RatingStars } from './rating-stars';

/** Creates and attaches `<rating-stars>` with the given attributes. */
const mount = (attributes: Record<string, string> = {}) => {
  const element = document.createElement('rating-stars') as RatingStars;
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  document.body.append(element);
  return element;
};
const stars = (element: RatingStars) => [...element.shadowRoot!.querySelectorAll('button')];

describe('E08.3 <rating-stars>', () => {
  it('renders max buttons in an open shadow root and exposes them as part="star"', () => {
    const element = mount({ max: '4' });
    expect(element.shadowRoot).not.toBeNull();
    expect(stars(element).map((star) => star.getAttribute('part'))).toEqual(['star', 'star', 'star', 'star']);
    expect(document.querySelectorAll('button')).toHaveLength(0);
  });

  it('value and max are observed attributes, and the value property reflects to the attribute', () => {
    const element = mount({ value: '2' });
    expect(RatingStars.observedAttributes).toEqual(['value', 'max']);
    element.setAttribute('max', '3');
    expect(stars(element)).toHaveLength(3);
    element.setAttribute('value', '3');
    expect(stars(element).map((star) => star.getAttribute('aria-pressed'))).toEqual(['true', 'true', 'true']);
    element.value = 1;
    expect([element.getAttribute('value'), element.value]).toEqual(['1', 1]);
  });

  it('clicking a star sets value and dispatches a rating-change CustomEvent (bubbles, composed) with detail.value, which a document listener receives with the host as target', () => {
    const element = mount();
    const received: [unknown, EventTarget | null, boolean, boolean][] = [];
    const listener = (event: Event) => received.push([(event as CustomEvent).detail.value, event.target, event.bubbles, event.composed]);
    document.addEventListener('rating-change', listener);
    stars(element)[3]!.click();
    document.removeEventListener('rating-change', listener);
    expect(element.value).toBe(4);
    expect(received).toEqual([[4, element, true, true]]);
  });

  it('a value outside 0…max is clamped', () => {
    const element = mount({ max: '5', value: '9' });
    expect(element.value).toBe(5);
    element.value = -2;
    expect([element.value, element.getAttribute('value')]).toEqual([0, '0']);
  });

  it('removing the element from the DOM removes its listeners (no event after removal)', () => {
    const element = mount();
    let events = 0;
    element.addEventListener('rating-change', () => events++);
    element.remove();
    stars(element)[0]!.click();
    expect([events, element.value]).toEqual([0, 0]);
  });
});
