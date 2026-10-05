import { useEffect, useLayoutEffect } from 'react';

// Every ref callback, ref cleanup and effect writes to this log.
export const log: string[] = [];

// Stable identity (module scope). Returns a cleanup, so React 19 never calls it with null.
function stableRef(node: HTMLInputElement) {
  log.push(`stable attach ${node.name}`);
  return () => {
    log.push(`stable cleanup ${node.name}`);
  };
}

// Pre-19 style: no cleanup returned, so React calls it again with null on detach.
function legacyRef(node: HTMLInputElement | null) {
  log.push(node ? 'legacy attach' : 'legacy null');
}

export function RefLog({ version }: { version: number }) {
  useLayoutEffect(() => {
    log.push(`layout effect ${version}`);
  });
  useEffect(() => {
    log.push(`effect ${version}`);
  });

  return (
    <>
      <input name="stable" ref={stableRef} />
      <input
        name="inline"
        // A new function on every render: React detaches the old one and attaches the new one.
        ref={() => {
          log.push(`inline attach ${version}`);
          return () => {
            log.push(`inline cleanup ${version}`);
          };
        }}
      />
      <input name="legacy" ref={legacyRef} />
    </>
  );
}
