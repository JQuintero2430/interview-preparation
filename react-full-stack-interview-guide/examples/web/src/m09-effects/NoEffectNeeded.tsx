import { useState } from 'react';

export type Todo = { id: number; text: string; done: boolean };

// 1) Derived data: compute during render. No useEffect + extra state, no extra render pass.
export function TodoList({ todos }: { todos: Todo[] }) {
  const [showDone, setShowDone] = useState(true);
  const visible = showDone ? todos : todos.filter((t) => !t.done);

  return (
    <>
      <label>
        <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
        Show completed
      </label>
      <ul>
        {visible.map((t) => (
          <li key={t.id}>{t.text}</li>
        ))}
      </ul>
    </>
  );
}

// 2) Resetting state when a prop changes: give the stateful child a key. No effect.
export function ProfilePage({ userId }: { userId: string }) {
  return <CommentDraft key={userId} userId={userId} />;
}

function CommentDraft({ userId }: { userId: string }) {
  const [draft, setDraft] = useState('');
  return (
    <label>
      Comment for {userId}
      <input value={draft} onChange={(e) => setDraft(e.target.value)} />
    </label>
  );
}

// 3) Responding to a user action: do it in the event handler, not in an effect watching state.
export function BuyButton({ onPurchase }: { onPurchase: (id: string) => void }) {
  return <button onClick={() => onPurchase('sku-1')}>Buy</button>;
}
