import { startTransition, useOptimistic, useState } from 'react';
import { setLike } from './api';

type LikeState = { liked: boolean; likes: number };
type Props = { postId: string; initial: LikeState };

const SAVE_FAILED = 'Could not save your like. Try again.';

/** Pure: the state the user expects after pressing the button. */
export function toggled({ liked, likes }: LikeState): LikeState {
  return { liked: !liked, likes: likes + (liked ? -1 : 1) };
}

export function LikeButton({ postId, initial }: Props) {
  const [saved, setSaved] = useState(initial); // the truth, as last confirmed by the server
  const [error, setError] = useState<string | null>(null);
  // `shown` equals `saved` except while an Action is pending, when it is the optimistic guess.
  const [shown, setShown] = useOptimistic(saved);

  function handleClick() {
    const next = toggled(shown);
    setError(null);
    startTransition(async () => {
      setShown(next); // rendered immediately; reverts on its own when this Action ends
      try {
        const confirmed = await setLike(postId, next.liked);
        // State set after an `await` needs its own transition to stay part of the Action.
        startTransition(() => setSaved(confirmed));
      } catch {
        // Nothing to undo by hand: `saved` never changed, so the optimistic value falls back to it.
        startTransition(() => setError(SAVE_FAILED));
      }
    });
  }

  return (
    <div>
      <button type="button" aria-pressed={shown.liked} onClick={handleClick}>
        Like
      </button>
      <span>{shown.likes} likes</span>
      {error && (
        <p role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
