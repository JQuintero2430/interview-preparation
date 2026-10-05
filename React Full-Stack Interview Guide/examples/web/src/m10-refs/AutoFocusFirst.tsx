import { Fragment, type FragmentInstance, type ReactNode } from 'react';

// React 19.3 Fragment ref: a handle on a group of children with no wrapper element.
// focus() walks the children depth-first and focuses the first focusable one.
function focusFirst(fragment: FragmentInstance | null) {
  fragment?.focus();
}

export function AutoFocusFirst({ children }: { children: ReactNode }) {
  return <Fragment ref={focusFirst}>{children}</Fragment>;
}
