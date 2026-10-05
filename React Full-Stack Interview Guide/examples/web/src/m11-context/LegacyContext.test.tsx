import { render, screen } from '@testing-library/react';
import {
  ClassLabel,
  ConsumerLabel,
  LegacyColorLabel,
  LegacyColorProvider,
  LocaleContext,
  OldProvider,
} from './LegacyContext';

test('in React 19, Context.Provider is the context object itself', () => {
  expect(LocaleContext.Provider).toBe(LocaleContext);
});

test('<Context.Provider>, <Context.Consumer> and static contextType all still work', () => {
  render(
    <OldProvider locale="es-CO">
      <ConsumerLabel />
      <ClassLabel />
    </OldProvider>,
  );
  expect(screen.getByText('Consumer sees es-CO')).toBeInTheDocument();
  expect(screen.getByText('Class sees es-CO')).toBeInTheDocument();
});

test('the new <Context value> provider feeds old-style consumers too', () => {
  render(
    <LocaleContext value="fr-FR">
      <ConsumerLabel />
      <ClassLabel />
    </LocaleContext>,
  );
  expect(screen.getByText('Consumer sees fr-FR')).toBeInTheDocument();
  expect(screen.getByText('Class sees fr-FR')).toBeInTheDocument();
});

test('legacy contextTypes/childContextTypes were removed in 19: an error is logged and no value arrives', () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  render(
    <LegacyColorProvider>
      <LegacyColorLabel />
    </LegacyColorProvider>,
  );
  expect(screen.getByText('Legacy color: none')).toBeInTheDocument();

  const messages = error.mock.calls.map((call) => String(call[0]));
  expect(messages.some((m) => m.includes('uses the legacy childContextTypes API which was removed in React 19'))).toBe(
    true,
  );
  expect(messages.some((m) => m.includes('uses the legacy contextTypes API which was removed in React 19'))).toBe(true);
  error.mockRestore();
});
