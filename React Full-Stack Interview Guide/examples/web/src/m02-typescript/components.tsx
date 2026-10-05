import type { ChangeEvent, ComponentProps, ComponentPropsWithRef, ComponentPropsWithoutRef, ElementType, FormEvent, ReactNode } from 'react';

/** Extend a native element's props instead of re-declaring them. `ComponentProps<'button'>` includes `ref` in React 19. */
type ButtonProps = ComponentProps<'button'> & { variant?: 'primary' | 'ghost' };

export function Button({ variant = 'primary', className, ...rest }: ButtonProps) {
  return <button {...rest} className={[`btn-${variant}`, className].filter(Boolean).join(' ')} />;
}

/** Typing `children`: `ReactNode` accepts anything renderable. Prefer it over `JSX.Element`, which rejects strings. */
export function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

type SelectProps<T> = {
  options: readonly T[];
  /** `NoInfer`: `options` decides T, `value` is checked against it instead of widening it. */
  value: NoInfer<T>;
  onChange: (value: T) => void;
  getKey: (option: T) => string;
  getLabel: (option: T) => string;
};

/** A generic component: T flows from `options` into every callback. */
export function Select<T>({ options, value, onChange, getKey, getLabel }: SelectProps<T>) {
  const handle = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = options.find((option) => getKey(option) === event.target.value);
    if (next !== undefined) onChange(next);
  };
  return (
    <select value={getKey(value)} onChange={handle}>
      {options.map((option) => (
        <option key={getKey(option)} value={getKey(option)}>
          {getLabel(option)}
        </option>
      ))}
    </select>
  );
}

/** Polymorphic `as` prop: the remaining props are the props of whatever element `as` names. */
type BoxProps<C extends ElementType> = { as?: C } & Omit<ComponentPropsWithoutRef<C>, 'as'>;

export function Box<C extends ElementType = 'div'>({ as, ...rest }: BoxProps<C>) {
  const Component: ElementType = as ?? 'div';
  return <Component {...rest} />;
}

/** Ref as a prop (React 19): `ref` arrives in props, no forwardRef. `ComponentPropsWithRef` includes it. */
export function FancyInput({ ref, ...rest }: ComponentPropsWithRef<'input'>) {
  return <input ref={ref} {...rest} />;
}

/** A union of prop shapes: the tag decides which other props are required. */
type AlertProps = { kind: 'link'; href: string; children: ReactNode } | { kind: 'button'; onClick: () => void; children: ReactNode };

export function Alert(props: AlertProps) {
  return props.kind === 'link' ? <a href={props.href}>{props.children}</a> : <button onClick={props.onClick}>{props.children}</button>;
}

/** Typed form event: the handler's parameter is FormEvent<HTMLFormElement>, so `currentTarget` is the form. */
export function SearchForm({ onSearch }: { onSearch: (query: string) => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query = data.get('q');
    onSearch(typeof query === 'string' ? query : '');
  };
  return (
    <form onSubmit={submit}>
      <input name="q" aria-label="Query" />
      <button type="submit">Search</button>
    </form>
  );
}
