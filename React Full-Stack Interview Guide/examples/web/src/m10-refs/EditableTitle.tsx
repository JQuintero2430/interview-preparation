import { useRef, useState, type SubmitEvent } from 'react';
import { flushSync } from 'react-dom';

// A stable callback ref (module scope): React calls it once when the input mounts
// and once with null when it unmounts, never on re-renders.
function focusAndSelect(input: HTMLInputElement | null) {
  input?.focus();
  input?.select();
}

export function EditableTitle({ initialTitle }: { initialTitle: string }) {
  const [title, setTitle] = useState(initialTitle);
  const [editing, setEditing] = useState(false);
  const editButtonRef = useRef<HTMLButtonElement>(null);

  function finish(nextTitle: string) {
    // Commit synchronously so the Edit button exists again before we focus it.
    flushSync(() => {
      setTitle(nextTitle);
      setEditing(false);
    });
    editButtonRef.current?.focus();
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get('title') ?? '').trim();
    finish(value || title);
  }

  if (editing) {
    return (
      <form onSubmit={handleSubmit}>
        <label>
          Title
          <input
            name="title"
            defaultValue={title}
            ref={focusAndSelect}
            onKeyDown={(e) => {
              if (e.key === 'Escape') finish(title);
            }}
          />
        </label>
        <button type="submit">Save</button>
      </form>
    );
  }

  return (
    <>
      <h2>{title}</h2>
      <button type="button" ref={editButtonRef} onClick={() => setEditing(true)}>
        Edit title
      </button>
    </>
  );
}
