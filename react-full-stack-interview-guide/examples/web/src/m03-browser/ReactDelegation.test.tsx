import { fireEvent, render, screen } from '@testing-library/react';
import type { MouseEvent } from 'react';
import { Stopper } from './ReactDelegation';

/**
 * React 17+ attaches its listeners to the ROOT CONTAINER (the element passed to createRoot), not to
 * `document`. React Testing Library's `render` creates a root on a <div> appended to <body>, so
 * `document` is an ANCESTOR of React's root and sees the event only after React is done with it.
 */
describe('React 17+ root delegation and stopPropagation', () => {
  test('a React stopPropagation() also stops the native event before it reaches document', () => {
    const onDocument = vi.fn();
    document.addEventListener('click', onDocument);
    render(<Stopper stop />);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('button')).toHaveTextContent('clicked 1'); // the React handler ran
    expect(onDocument).not.toHaveBeenCalled(); // 16 would have called it (React sat ON document)
    document.removeEventListener('click', onDocument);
  });

  test('without stopPropagation the document listener runs after the React handler', () => {
    const order: string[] = [];
    const onDocument = () => order.push('document');
    document.addEventListener('click', onDocument);
    render(<Stopper stop={false} onEvent={() => order.push('react')} />);

    fireEvent.click(screen.getByRole('button'));

    expect(order).toEqual(['react', 'document']);
    document.removeEventListener('click', onDocument);
  });

  test('a NATIVE listener on the button that stops propagation starves React: onClick never runs', () => {
    const onEvent = vi.fn();
    render(<Stopper stop={false} onEvent={onEvent} />);
    // The native event must bubble from the button up to the root for React to see it.
    screen.getByRole('button').addEventListener('click', (e) => e.stopPropagation());

    fireEvent.click(screen.getByRole('button'));

    expect(onEvent).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toHaveTextContent('clicked 0');
  });

  test('no event pooling since 17: the synthetic event stays readable after the handler, but currentTarget is reset', () => {
    const seen: MouseEvent<HTMLButtonElement>[] = [];
    render(<Stopper stop={false} onEvent={(e) => seen.push(e)} />);

    fireEvent.click(screen.getByRole('button'));

    const saved = seen[0];
    expect(saved).toBeDefined();
    expect(saved?.type).toBe('click'); // not nulled out as in React <=16 pooling
    expect(saved?.target).toBe(screen.getByRole('button'));
    expect(saved?.currentTarget).toBeNull(); // currentTarget is only valid DURING dispatch
  });
});
