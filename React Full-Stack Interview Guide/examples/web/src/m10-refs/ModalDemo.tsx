import { useState } from 'react';
import { Modal } from './Modal';

export function ModalDemo() {
  const [open, setOpen] = useState(false);
  const [clicks, setClicks] = useState(0);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open settings
      </button>
      <p>Clicks seen by the wrapper: {clicks}</p>
      {/* The dialog's DOM lives in document.body, but its React parent is this div. */}
      <div onClick={() => setClicks((c) => c + 1)}>
        {open && (
          <Modal title="Settings" onClose={() => setOpen(false)}>
            <button type="button">Save</button>
          </Modal>
        )}
      </div>
    </>
  );
}
