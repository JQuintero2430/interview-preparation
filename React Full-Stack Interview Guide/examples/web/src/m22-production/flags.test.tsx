import { render, screen } from '@testing-library/react';
import { flagDefaults, FlagsProvider, mergeFlags, parseFlags, useFlag, type Flags } from './flags';

function Probe() {
  const checkout = useFlag('newCheckout');
  const max = useFlag('maxItems');
  const banner = useFlag('bannerText');
  return (
    <p>
      {checkout ? 'new checkout' : 'old checkout'} / {max} / [{banner}]
    </p>
  );
}

test('without a provider the defaults apply', () => {
  render(<Probe />);
  expect(screen.getByText('old checkout / 10 / []')).toBeInTheDocument();
});

test('remote values replace defaults', () => {
  render(
    <FlagsProvider flags={{ newCheckout: true, maxItems: 25 }}>
      <Probe />
    </FlagsProvider>,
  );
  expect(screen.getByText('new checkout / 25 / []')).toBeInTheDocument();
});

test('overrides beat remote values', () => {
  render(
    <FlagsProvider flags={{ newCheckout: true }} overrides={{ newCheckout: false, bannerText: 'QA' }}>
      <Probe />
    </FlagsProvider>,
  );
  expect(screen.getByText('old checkout / 10 / [QA]')).toBeInTheDocument();
});

test('rerendering with new flags updates consumers (no effect, no state)', () => {
  const { rerender } = render(
    <FlagsProvider flags={{ newCheckout: false }}>
      <Probe />
    </FlagsProvider>,
  );
  rerender(
    <FlagsProvider flags={{ newCheckout: true }}>
      <Probe />
    </FlagsProvider>,
  );
  expect(screen.getByText('new checkout / 10 / []')).toBeInTheDocument();
});

test('mergeFlags ignores undefined', () => {
  expect(mergeFlags({ maxItems: undefined }, { searchV2: true })).toEqual({ ...flagDefaults, searchV2: true });
});

test('parseFlags drops unknown names and wrong types', () => {
  const parsed = parseFlags({ newCheckout: true, maxItems: '99', bannerText: 'hi', surprise: true });
  expect(parsed).toEqual({ newCheckout: true, bannerText: 'hi' });
  expectTypeOf(parsed).toEqualTypeOf<Partial<Flags>>();
  expect(parseFlags(null)).toEqual({});
});
