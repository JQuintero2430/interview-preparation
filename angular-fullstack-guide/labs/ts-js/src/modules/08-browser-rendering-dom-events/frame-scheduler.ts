// Exercise 08.2: queue DOM reads and writes, then run all reads before all writes once per frame.

type Job = () => void;

/** Queues jobs for the next frame. */
export interface FrameScheduler {
  /** Queues a job that only reads layout (sizes, positions). */
  measure(job: Job): void;
  /** Queues a job that only writes to the DOM or styles. */
  mutate(job: Job): void;
}

/**
 * Creates a scheduler that runs, in the next frame, every queued read and then every queued write.
 * @param requestFrame Schedules the flush; tests pass a fake, browsers use `requestAnimationFrame`.
 * @returns The scheduler. A job that throws does not stop the others; the errors are rethrown together after the flush.
 */
export function createFrameScheduler(requestFrame: (callback: () => void) => unknown = requestAnimationFrame): FrameScheduler {
  let reads: Job[] = [];
  let writes: Job[] = [];
  let scheduled = false;

  const flush = () => {
    // Swap the queues first, so a job queued during this flush lands in the next frame.
    const jobs = [...reads, ...writes];
    reads = [];
    writes = [];
    scheduled = false;
    const errors: unknown[] = [];
    for (const job of jobs) {
      try {
        job();
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length > 0) throw new AggregateError(errors, `${errors.length} frame job(s) failed`);
  };

  const enqueue = (queue: Job[], job: Job) => {
    queue.push(job);
    if (scheduled) return;
    scheduled = true;
    requestFrame(flush);
  };

  return { measure: (job) => enqueue(reads, job), mutate: (job) => enqueue(writes, job) };
}
