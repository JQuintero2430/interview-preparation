import { useState } from 'react';
import { track } from './analytics';

type CopyState = 'idle' | 'copied' | 'failed';

/** Copies `url` to the clipboard, tracks it, and reports the outcome in a live region. */
export function CopyLinkButton({ url }: { url: string }) {
  const [state, setState] = useState<CopyState>('idle');

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      setState('failed');
      return;
    }
    track('link_copied', { url });
    setState('copied');
  }

  return (
    <div>
      <button type="button" onClick={() => void copy()}>
        Copy link
      </button>
      {state === 'copied' && <p role="status">Copied!</p>}
      {state === 'failed' && <p role="alert">Could not copy the link. Copy it from the address bar.</p>}
    </div>
  );
}
