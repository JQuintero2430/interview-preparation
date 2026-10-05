import { useState } from 'react';
import { CenteredModal } from './CenteredModal';

// The "animated page wrapper" that breaks position: fixed and z-index for its descendants.
// Any of transform, filter, perspective, opacity < 1, will-change: transform, contain: paint
// on an ancestor does the same thing.
export function TransformedPage({ portal }: { portal: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div data-testid="animated-ancestor" style={{ transform: 'translateZ(0)' }}>
      <button type="button" onClick={() => setOpen(true)}>
        Open settings
      </button>
      {open && (
        <CenteredModal title="Settings" portal={portal} onClose={() => setOpen(false)}>
          <p>Modal body</p>
        </CenteredModal>
      )}
    </div>
  );
}
