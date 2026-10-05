import { useId } from 'react';

/**
 * A text input wired to its label and hint by ids that are unique per instance and identical
 * on the server and the client, so the same field can render many times on one page.
 * @param label - Visible label text.
 * @param hint - Help text, announced through `aria-describedby`.
 */
export function LabeledField({ label, hint }: { label: string; hint: string }) {
  const id = useId(); // one call, then derive related ids from it
  const inputId = `${id}-input`;
  const hintId = `${id}-hint`;

  return (
    <div>
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} aria-describedby={hintId} />
      <p id={hintId}>{hint}</p>
    </div>
  );
}
