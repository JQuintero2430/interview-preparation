// Section 2. jsdom does no layout, so this file proves only the order of operations: a fake element logs each
// geometry read and each style write. Whether a read forces layout is the browser's behavior (web.dev, cited in §2).

type Log = ('read' | 'write')[];

/** An element stand-in whose `offsetHeight` read and `style.height` write are recorded in `log`. */
const recordedBox = (log: Log) => ({
  get offsetHeight() {
    log.push('read');
    return 100;
  },
  style: {
    set height(_value: string) {
      log.push('write');
    },
  },
});

/** Counts reads that follow a write: in a browser each one may force a synchronous layout. */
const readsAfterWrite = (log: Log) => log.filter((entry, i) => entry === 'read' && log.slice(0, i).includes('write')).length;

describe('Module 08 · section 2', () => {
  it('Section 2: the interleaved loop reads after every write; the batched version reads everything first', () => {
    const thrashing: Log = [];
    const boxes = [1, 2, 3].map(() => recordedBox(thrashing));
    for (const box of boxes) box.style.height = `${box.offsetHeight * 2}px`;
    expect(thrashing).toEqual(['read', 'write', 'read', 'write', 'read', 'write']);
    expect(readsAfterWrite(thrashing)).toBe(2);

    const batched: Log = [];
    const sameBoxes = [1, 2, 3].map(() => recordedBox(batched));
    const heights = sameBoxes.map((box) => box.offsetHeight);
    heights.forEach((height, i) => (sameBoxes[i]!.style.height = `${height * 2}px`));
    expect(batched).toEqual(['read', 'read', 'read', 'write', 'write', 'write']);
    expect(readsAfterWrite(batched)).toBe(0);
  });
});
