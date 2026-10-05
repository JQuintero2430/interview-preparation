import { useId, type ReactNode } from 'react';

type CardProps = {
  title: ReactNode; // slot: the heading content
  actions?: ReactNode; // slot: buttons in the header, top right
  footer?: ReactNode; // slot: rendered only when provided
  children: ReactNode; // the body: the "default slot"
};

/** A layout shell with named slots. It decides where things go, never what they are. */
export function Card({ title, actions, footer, children }: CardProps) {
  const titleId = useId();

  return (
    <article className="card" aria-labelledby={titleId}>
      <header className="card-header">
        <h3 id={titleId}>{title}</h3>
        {actions != null && <div className="card-actions">{actions}</div>}
      </header>
      <div className="card-body">{children}</div>
      {footer != null && <footer className="card-footer">{footer}</footer>}
    </article>
  );
}
