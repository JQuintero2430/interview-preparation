import type { CSSProperties, ReactNode } from 'react';
import styles from './AccentCard.module.css';

type Props = { title: string; accent: string; children: ReactNode };

export function AccentCard({ title, accent, children }: Props) {
  // CSSProperties does not know custom properties, hence the cast.
  const style = { '--accent': accent } as CSSProperties;
  return (
    <section className={styles.card} style={style} aria-label={title}>
      <h3 className={styles.title}>{title}</h3>
      {children}
    </section>
  );
}
