/** One chunk of our upload protocol: a byte range of the file, both ends inclusive like `Content-Range`. */
export interface ChunkRange {
  readonly index: number;
  readonly start: number;
  readonly end: number;
}

/** Splits `totalBytes` into consecutive ranges of at most `chunkBytes`; an empty file has no chunks. */
export function planChunks(totalBytes: number, chunkBytes: number): readonly ChunkRange[] {
  if (!Number.isInteger(totalBytes) || totalBytes < 0) throw new RangeError(`Bad file size: ${totalBytes}`);
  if (!Number.isInteger(chunkBytes) || chunkBytes < 1) throw new RangeError(`Bad chunk size: ${chunkBytes}`);
  const ranges: ChunkRange[] = [];
  for (let start = 0; start < totalBytes; start += chunkBytes) {
    ranges.push({ index: ranges.length, start, end: Math.min(start + chunkBytes, totalBytes) - 1 });
  }
  return ranges;
}

/** The `Content-Range` value for one chunk: `bytes first-last/complete-length`, the syntax of RFC 9110 §14.4. */
export function contentRangeFor(range: ChunkRange, totalBytes: number): string {
  return `bytes ${range.start}-${range.end}/${totalBytes}`;
}

/** The chunks still to send once the server reports it holds the first `storedBytes` bytes. */
export function remainingChunks(plan: readonly ChunkRange[], storedBytes: number): readonly ChunkRange[] {
  return plan.filter((range) => range.end >= storedBytes);
}
