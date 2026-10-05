import type { ReactNode } from 'react';
import styles from './HolyGrail.module.css';

type Props = {
  title: string;
  nav: ReactNode;
  aside: ReactNode;
  children: ReactNode;
};

const MAIN_ID = 'main-content';

export function HolyGrail({ title, nav, aside, children }: Props) {
  return (
    <div className={styles.page}>
      <a className={styles.skip} href={`#${MAIN_ID}`}>
        Skip to main content
      </a>
      <header className={styles.header}>
        <h1>{title}</h1>
      </header>
      <nav className={styles.nav} aria-label="Primary">
        {nav}
      </nav>
      {/* tabIndex=-1 lets the skip link move focus here without adding a tab stop */}
      <main id={MAIN_ID} tabIndex={-1} className={styles.main}>
        {children}
      </main>
      <aside className={styles.aside} aria-label="Related">
        {aside}
      </aside>
      <footer className={styles.footer}>
        <small>Example footer</small>
      </footer>
    </div>
  );
}
