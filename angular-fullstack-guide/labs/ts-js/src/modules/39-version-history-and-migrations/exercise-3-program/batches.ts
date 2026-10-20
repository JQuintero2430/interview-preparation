// The part of Exercise 39.3 that does not change: given an order, pack each migration's folders into pull requests
// that stay within the cap, and give every pull request a checkpoint (section 10: build, tests, a render check, a commit).
import type { Folder, Migration, Program, PullRequest } from './program';

export const CHECKPOINT: readonly string[] = ['build', 'tests', 'render check', 'commit'];

/** Next-fit packing: folders keep their order, and a group closes when the next folder would pass the cap. */
function packFolders(folders: readonly Folder[], cap: number): Folder[][] {
  const groups: Folder[][] = [];
  let used = 0;
  for (const folder of folders) {
    if (folder.components > cap) throw new Error(`folder ${folder.name} has ${folder.components} components, above the cap of ${cap}`);
    const open = groups.at(-1);
    if (open !== undefined && used + folder.components <= cap) {
      open.push(folder);
      used += folder.components;
    } else {
      groups.push([folder]);
      used = folder.components;
    }
  }
  return groups;
}

function pullRequestsFor(migration: Migration, program: Program): PullRequest[] {
  const groups = migration.scope === 'folders' ? packFolders(program.folders, program.cap) : [[]];
  return groups.map((group) => ({
    migration: migration.id,
    track: migration.track,
    folders: group.map((folder) => folder.name),
    components: group.reduce((sum, folder) => sum + folder.components, 0),
    checkpoint: [...CHECKPOINT],
  }));
}

export function pullRequestsIn(order: readonly Migration[], program: Program): PullRequest[] {
  return order.flatMap((migration) => pullRequestsFor(migration, program));
}
