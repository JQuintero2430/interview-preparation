import { render, screen } from '@testing-library/react';
import { AccentCard } from './AccentCard';

describe('AccentCard', () => {
  it('applies CSS Module classes and passes the dynamic value as a custom property', () => {
    render(
      <AccentCard title="Status" accent="rebeccapurple">
        Body
      </AccentCard>,
    );
    const card = screen.getByRole('region', { name: 'Status' });
    expect(card.className).toMatch(/_card_/);
    expect(screen.getByRole('heading', { name: 'Status' }).className).toMatch(/_title_/);
    expect(card.style.getPropertyValue('--accent')).toBe('rebeccapurple');
  });
});
