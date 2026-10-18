// Section 11 claims: the lab's package-lock.json (read-only) pins every package to a version, a registry tarball
// and a sha512 integrity hash, and an SRI digest (the format the build writes in `integrity`) changes with one byte.
// No test here talks to the npm registry.

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync } = (await import(fsSpecifier)) as { readFileSync: (path: URL, encoding: 'utf8') => string };

interface LockEntry {
  readonly version?: string;
  readonly resolved?: string;
  readonly integrity?: string;
  readonly link?: boolean;
}

interface Lockfile {
  readonly lockfileVersion: number;
  readonly packages: Readonly<Record<string, LockEntry>>;
}

const lockfile = JSON.parse(readFileSync(new URL('../../../../angular/package-lock.json', import.meta.url), 'utf8')) as Lockfile;

/** `sha384-` followed by the base64 digest, the way an `integrity` attribute spells it. */
async function sri(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-384', bytes));
  return `sha384-${btoa(String.fromCharCode(...digest))}`;
}

describe('Section 11: lockfile and Subresource Integrity', () => {
  it('Section 11: every package in the labs/angular lockfile pins a version and a sha512 integrity hash', () => {
    expect(lockfile.lockfileVersion).toBe(3);
    // "" is the project itself; every other key is an installed package.
    const installed = Object.entries(lockfile.packages).filter(([path]) => path !== '');
    expect(installed.length).toBeGreaterThan(100);
    // The run shows no exception: no link, no git dependency, no entry without a hash.
    const exceptions = installed.filter(([, entry]) => entry.link === true || entry.integrity === undefined);
    expect(exceptions).toEqual([]);
    for (const [path, entry] of installed) {
      expect(entry.version, path).toMatch(/^\d+\.\d+\.\d+/);
      expect(entry.resolved, path).toMatch(/^https:\/\/registry\.npmjs\.org\/.+\.tgz$/);
      // sha512 is 64 bytes: 86 base64 characters and "==".
      expect(entry.integrity, path).toMatch(/^sha512-[A-Za-z0-9+/]{86}==$/);
    }
    expect(lockfile.packages['']?.integrity).toBeUndefined();
  });

  it('Section 11: an SRI hash changes when one byte of the file changes', async () => {
    const original = new TextEncoder().encode("alert('Hello, world.');");
    // The W3C Subresource Integrity example for exactly this script (Working Draft, 20 March 2026, section 3.1).
    expect(await sri(original)).toBe('sha384-H8BRh8j48O9oYatfu5AZzq6A9RINhZO5H16dQZngK7T62em8MUt1FLm52t+eX6xO');
    const edited = original.slice();
    edited[7] = (edited[7] ?? 0) ^ 1; // one bit of one byte
    const changed = await sri(edited);
    expect(changed).not.toBe(await sri(original));
    // The format does not change: algorithm, a dash, 48 bytes as 64 base64 characters.
    expect(changed).toMatch(/^sha384-[A-Za-z0-9+/]{64}$/);
    expect(await sri(new Uint8Array(0))).toMatch(/^sha384-[A-Za-z0-9+/]{64}$/);
  });
});
