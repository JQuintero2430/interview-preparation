'use client';

import { useState, type ReactNode } from 'react';

// A Client Component that renders `children` it did not create. The caller (a Server
// Component) built those children on the server; this component only decides whether to show them.
export function Collapsible({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section>
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? 'Hide' : 'Show'} {title}
      </button>
      {open && children}
    </section>
  );
}
