// Section 2 model: which steps of one Dockerfile stage Docker rebuilds when files in the build context change. Our
// model, not Docker's code. It mirrors the rule on docs.docker.com/build/cache/invalidation/ (read 2026-10-22):
// "For the ADD and COPY instructions ... the builder calculates a cache checksum from file metadata", "The
// modification time of a file (mtime) is not taken into account", "Aside from the ADD and COPY commands, cache
// checking doesn't look at the files in the container ... the command string itself is used to find a match" and
// "Once the cache is invalidated, all subsequent Dockerfile commands generate new images and the cache isn't used."
// (all abridged). A `changed` path stands for a file whose checksum changed. Not modeled: globs in a COPY source,
// `COPY --from` (its input is another stage), the `.dockerignore` filter and a changed command string. Nothing here
// reads a file, a clock or a network.

export interface Step {
  /** The whole instruction, such as `RUN npm ci`. */
  readonly instruction: string;
  /** The context paths a `COPY` reads; empty for every other instruction and for `COPY --from`. */
  readonly sources: readonly string[];
}

export interface Stage {
  readonly base: string;
  readonly name?: string;
  readonly steps: readonly Step[];
}

function normalize(path: string): string {
  return path.replace(/^\.\//, '').replace(/\/$/, '');
}

/** True when a changed file lies inside a `COPY` source: the source itself, a folder holding it, or `.`. */
function covers(source: string, file: string): boolean {
  const root = normalize(source);
  return root === '.' || file === root || file.startsWith(`${root}/`);
}

/**
 * The steps Docker rebuilds: a step is rebuilt when a file it copies changed or when any earlier step was rebuilt,
 * because a changed layer invalidates every layer after it.
 */
export function rebuiltSteps(steps: readonly Step[], changed: readonly string[]): readonly string[] {
  let invalidated = false;
  const rebuilt: string[] = [];
  for (const step of steps) {
    invalidated = invalidated || step.sources.some((source) => changed.some((file) => covers(source, file)));
    if (invalidated) {
      rebuilt.push(step.instruction);
    }
  }
  return rebuilt;
}

/** Joins `\` continuations and drops blank lines and comments. */
function logicalLines(dockerfile: string): readonly string[] {
  return dockerfile
    .replace(/\\\n/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'));
}

/** The paths a `COPY` reads from the context: its arguments without flags and without the destination. */
function copySources(args: readonly string[]): readonly string[] {
  const fromStage = args.some((arg) => arg.startsWith('--from='));
  const paths = args.filter((arg) => !arg.startsWith('--'));
  return fromStage ? [] : paths.slice(0, -1);
}

/** Splits a Dockerfile's text into stages, one per `FROM`. */
export function parseStages(dockerfile: string): readonly Stage[] {
  const stages: { base: string; name?: string; steps: Step[] }[] = [];
  for (const line of logicalLines(dockerfile)) {
    const [keyword = '', ...args] = line.split(/\s+/);
    if (keyword === 'FROM') {
      const [base = '', connector = '', name] = args;
      stages.push({ base, name: connector.toUpperCase() === 'AS' ? name : undefined, steps: [] });
    } else {
      stages.at(-1)?.steps.push({ instruction: line, sources: keyword === 'COPY' ? copySources(args) : [] });
    }
  }
  return stages;
}
