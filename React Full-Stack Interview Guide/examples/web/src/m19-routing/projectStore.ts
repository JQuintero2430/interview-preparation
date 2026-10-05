export type ProjectStatus = 'active' | 'archived';

export type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  starred: boolean;
};

export const seedProjects: readonly Project[] = [
  { id: 'apollo', name: 'Apollo', status: 'active', starred: false },
  { id: 'apiary', name: 'Apiary', status: 'archived', starred: false },
  { id: 'borealis', name: 'Borealis', status: 'active', starred: true },
  { id: 'cobalt', name: 'Cobalt', status: 'archived', starred: false },
];

export type ProjectFilter = { q?: string; status?: ProjectStatus | '' };

type StoreOptions = {
  /** Runs before every write. Tests pass a gate here to hold an action "in flight". */
  beforeWrite?: () => Promise<void>;
};

/** Reads a `?status=` value from the URL; anything unknown means "no filter". */
export function parseStatus(value: string | null): ProjectStatus | '' {
  return value === 'active' || value === 'archived' ? value : '';
}

/**
 * An in-memory stand-in for a backend. Every call returns copies, so a component can never
 * mutate "server" data by accident. Create one per test.
 */
export function createProjectStore(seed: readonly Project[] = seedProjects, options: StoreOptions = {}) {
  let projects: Project[] = seed.map((p) => ({ ...p }));

  return {
    list({ q = '', status = '' }: ProjectFilter = {}): Project[] {
      const needle = q.trim().toLowerCase();
      return projects
        .filter((p) => (status ? p.status === status : true))
        .filter((p) => (needle ? p.name.toLowerCase().includes(needle) : true))
        .map((p) => ({ ...p }));
    },
    get(id: string): Project | undefined {
      const found = projects.find((p) => p.id === id);
      return found ? { ...found } : undefined;
    },
    nameTaken(name: string, exceptId: string): boolean {
      return projects.some((p) => p.id !== exceptId && p.name.toLowerCase() === name.toLowerCase());
    },
    async rename(id: string, name: string): Promise<void> {
      await options.beforeWrite?.();
      projects = projects.map((p) => (p.id === id ? { ...p, name } : p));
    },
    async setStarred(id: string, starred: boolean): Promise<void> {
      await options.beforeWrite?.();
      projects = projects.map((p) => (p.id === id ? { ...p, starred } : p));
    },
  };
}

export type ProjectStore = ReturnType<typeof createProjectStore>;

/** A promise the test resolves by hand: holds an action or loader "in flight". */
export function createGate() {
  let open: () => void = () => {};
  const promise = new Promise<void>((resolve) => {
    open = resolve;
  });
  return { promise, open: () => open() };
}
