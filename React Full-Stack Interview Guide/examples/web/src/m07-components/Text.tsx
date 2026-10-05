import type { ComponentPropsWithoutRef, ElementType } from 'react';

// `as` picks the element; the rest of the props are typed for THAT element.
type TextProps<C extends ElementType> = { as?: C } & Omit<ComponentPropsWithoutRef<C>, 'as'>;

/** Polymorphic text: `<Text as="label" htmlFor="x">` renders a label and type-checks label props. */
export function Text<C extends ElementType = 'span'>({ as, ...rest }: TextProps<C>) {
  // Widened to ElementType so TypeScript does not try to relate the generic props to C again.
  const Component: ElementType = as ?? 'span';
  return <Component {...rest} />;
}
