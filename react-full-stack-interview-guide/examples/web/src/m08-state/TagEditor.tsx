import { useReducer, useState } from 'react';
import { initHistory, undoable } from './undoable';

type TagAction = { type: 'added'; tag: string } | { type: 'removed'; tag: string };

/** Pure reducer for a list of unique tags. Returns `tags` itself when nothing changes. */
export function tagsReducer(tags: readonly string[], action: TagAction): readonly string[] {
  switch (action.type) {
    case 'added':
      return tags.includes(action.tag) ? tags : [...tags, action.tag];
    case 'removed':
      return tags.includes(action.tag) ? tags.filter((t) => t !== action.tag) : tags;
  }
}

// Created once at module level: the wrapped reducer must be the same function on every render.
const tagsHistoryReducer = undoable(tagsReducer);
const noTags: readonly string[] = [];

/** Tag list with undo/redo. The input draft is UI state and deliberately not part of the history. */
export function TagEditor() {
  const [history, dispatch] = useReducer(tagsHistoryReducer, noTags, initHistory);
  const [draft, setDraft] = useState('');

  return (
    <section>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const tag = draft.trim();
          if (!tag) return;
          dispatch({ type: 'apply', action: { type: 'added', tag } });
          setDraft('');
        }}
      >
        <label>
          New tag
          <input value={draft} onChange={(e) => setDraft(e.target.value)} />
        </label>
        <button type="submit">Add</button>
      </form>

      <ul aria-label="Tags">
        {history.present.map((tag) => (
          <li key={tag}>
            <span>{tag}</span>
            <button
              aria-label={`Remove ${tag}`}
              onClick={() => dispatch({ type: 'apply', action: { type: 'removed', tag } })}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <button onClick={() => dispatch({ type: 'undo' })} disabled={history.past.length === 0}>
        Undo
      </button>
      <button onClick={() => dispatch({ type: 'redo' })} disabled={history.future.length === 0}>
        Redo
      </button>
    </section>
  );
}
