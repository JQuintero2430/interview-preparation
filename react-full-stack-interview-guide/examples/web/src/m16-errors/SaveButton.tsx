import { useState, useTransition } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { useThrowToBoundary } from './useThrowToBoundary';

type Props = { save: () => Promise<void> };

/** react-error-boundary: catch the rejection, then showBoundary(error). */
export function SaveWithLibrary({ save }: Props) {
  const { showBoundary } = useErrorBoundary();
  const [saved, setSaved] = useState(false);

  async function handleClick() {
    try {
      await save();
      setSaved(true);
    } catch (error) {
      showBoundary(error);
    }
  }

  return (
    <button type="button" onClick={handleClick}>
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}

/** Plain React: throw from a state updater. Works with ANY boundary, hand-written or not. */
export function SavePlain({ save }: Props) {
  const throwToBoundary = useThrowToBoundary();
  const [saved, setSaved] = useState(false);

  function handleClick() {
    save().then(() => setSaved(true), throwToBoundary);
  }

  return (
    <button type="button" onClick={handleClick}>
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}

/** React 19 Actions: an error thrown inside startTransition goes to the nearest boundary. */
export function SaveWithTransition({ save }: Props) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleClick() {
    startTransition(async () => {
      await save(); // a rejection here is rethrown during render, so a boundary catches it
      startTransition(() => setSaved(true)); // updates after an await need their own transition
    });
  }

  const label = saved ? 'Saved' : 'Save';
  return (
    <button type="button" onClick={handleClick} disabled={isPending}>
      {isPending ? 'Saving…' : label}
    </button>
  );
}
