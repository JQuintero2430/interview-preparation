import { readdir } from 'node:fs/promises';
import { expect, type Page, test } from '@playwright/test';
import { animationsOf, classesOf, distFile, finishAll, MOTION_ORIGIN } from '../support/motion.js';

// The engine's marker class (NG_ANIMATING_CLASSNAME) is a string of @angular/animations/browser only.
const ENGINE_MARKER = 'ng-animating';
// The metadata helpers (trigger, state, …) bring the AnimationMetadataType enum, whose names survive minification.
const METADATA_MARKER = 'AnimateChild';

interface BuildChunks {
  /** Every .js file of the build, by name. */
  files: Map<string, string>;
  /** The files index.html loads and everything they import statically. */
  initial: Set<string>;
  /** The file names targets of a dynamic import(), per importing file. */
  dynamicTargets: Map<string, string[]>;
}

async function readBuild(folder: string): Promise<BuildChunks> {
  const url = new URL(`../../../../angular/dist/${folder}/`, import.meta.url);
  const names = (await readdir(url)).filter((name) => name.endsWith('.js'));
  const files = new Map<string, string>();
  for (const name of names) files.set(name, (await distFile(`${folder}/${name}`)).toString('utf8'));
  const html = (await distFile(`${folder}/index.html`)).toString('utf8');
  const pending = [...html.matchAll(/<script src="([^"]+\.js)" type="module">/g)].map((match) => match[1] ?? '');
  const initial = new Set<string>();
  while (pending.length > 0) {
    const name = pending.pop() ?? '';
    if (initial.has(name)) continue;
    initial.add(name);
    const source = files.get(name) ?? '';
    for (const match of source.matchAll(/(?:^|[;}])import\s*(?:[^"'`()]*?from\s*)?["']\.\/([^"']+\.js)["']/g)) pending.push(match[1] ?? '');
  }
  const dynamicTargets = new Map<string, string[]>();
  for (const [name, source] of files) {
    dynamicTargets.set(name, [...source.matchAll(/import\(\s*[`"']\.\/([^`"']+\.js)[`"']\s*\)/g)].map((match) => match[1] ?? ''));
  }
  return { files, initial, dynamicTargets };
}

function containing(build: BuildChunks, marker: string): string[] {
  return [...build.files].filter(([, source]) => source.includes(marker)).map(([name]) => name);
}

async function openMigration(page: Page, prefix = ''): Promise<void> {
  await page.goto(`${MOTION_ORIGIN}${prefix}/m35/migration`);
  await expect(page.getByRole('heading', { level: 1, name: 'Section 9: migration' })).toBeVisible();
}

test('Section 9: the migrated panel runs a CSSTransition where the legacy one ran a script animation', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();

  await openMigration(page, '/legacy');
  const legacyPanel = page.getByTestId('mig-panel');
  await page.getByRole('button', { name: 'Toggle panel' }).click();
  await expect.poll(async () => (await animationsOf(legacyPanel)).map(({ kind }) => kind)).toEqual(['script']);
  await finishAll(page);

  await openMigration(page);
  const panel = page.getByTestId('mig-panel');
  await page.getByRole('button', { name: 'Toggle panel' }).click();
  await expect
    .poll(async () => (await animationsOf(panel)).map(({ kind, property }) => `${kind} ${property}`).sort())
    .toEqual(['css-transition height', 'css-transition opacity']);
  await finishAll(page);
  await context.close();
});

test('Section 9: the legacy panel keeps its closed state in inline styles and the migrated panel in a class', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const inline = (target: Page) => target.getByTestId('mig-panel').evaluate((element) => element.getAttribute('style'));

  await openMigration(page, '/legacy');
  await page.getByRole('button', { name: 'Toggle panel' }).click();
  await expect.poll(async () => (await animationsOf(page.getByTestId('mig-panel'))).length).toBe(1);
  await finishAll(page);
  await expect(page.getByTestId('mig-panel')).toHaveText('Panel is closed');
  await expect.poll(() => inline(page)).toContain('height: 20px');
  expect(await classesOf(page.getByTestId('mig-panel'))).toEqual(['m35-mig-panel', 'ng-trigger', 'ng-trigger-panel']);

  await openMigration(page);
  await page.getByRole('button', { name: 'Toggle panel' }).click();
  await finishAll(page);
  await expect(page.getByTestId('mig-panel')).toHaveText('Panel is closed');
  expect(await inline(page)).toBeNull();
  expect(await classesOf(page.getByTestId('mig-panel'))).toEqual(['m35-mig-panel', 'm35-closed']);
  await context.close();
});

test('Section 9: a class that sets animation none removes a leaving element at once', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const note = page.getByTestId('class-note');

  // Control: the leave class runs its 20 s animation, so the note stays until the test finishes it.
  await openMigration(page);
  await page.getByRole('button', { name: 'Remove notes' }).click();
  // Emulated encapsulation prefixes the keyframes name, so the test matches its end.
  await expect
    .poll(async () => (await animationsOf(note)).map(({ kind, name }) => `${kind} ${name.endsWith('_m35-note-fade')}`))
    .toEqual(['css-animation true']);
  await finishAll(page);
  await expect(note).toHaveCount(0);

  // The migration guide's class: nothing animates, and the note goes without finishAll.
  await openMigration(page);
  await page.getByLabel('Disable motion').check();
  await page.getByRole('button', { name: 'Remove notes' }).click();
  await expect(note).toHaveCount(0);
  await context.close();
});

test('Section 9: under animation none a leave callback that waits for animationend keeps the element until MAX_ANIMATION_TIMEOUT', async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openMigration(page);
  await page.getByLabel('Disable motion').check();
  await page.getByRole('button', { name: 'Remove notes' }).click();

  // The class-form sibling is gone at once; the callback's element waits for an animationend that never fires.
  await expect(page.getByTestId('class-note')).toHaveCount(0);
  const callbackNote = page.getByTestId('callback-note');
  await expect(callbackNote).toHaveAttribute('data-leaving', 'true');
  expect(await classesOf(callbackNote)).toContain('m35-note-cb-out');
  expect(await animationsOf(callbackNote)).toEqual([]);
  // The default MAX_ANIMATION_TIMEOUT (4000 ms, read from @angular/core) removes it in the end.
  await expect(callbackNote).toHaveCount(0, { timeout: 15_000 });
  await context.close();
});

test('Section 9: the legacy build ships an animations chunk the native build does not', async () => {
  const native = await readBuild('animations-lab/browser');
  const legacy = await readBuild('animations-lab-legacy/browser');

  // Native build: no file holds the engine; the metadata helpers sit only in chunks no initial file loads.
  expect(containing(native, ENGINE_MARKER)).toEqual([]);
  const nativeMetadata = containing(native, METADATA_MARKER);
  expect(nativeMetadata.length).toBeGreaterThan(0);
  expect(nativeMetadata.filter((name) => native.initial.has(name))).toEqual([]);

  // Legacy build: one lazy chunk holds the engine, and the initial main file imports it dynamically.
  const engine = containing(legacy, ENGINE_MARKER);
  expect(engine).toHaveLength(1);
  const [engineChunk = ''] = engine;
  expect(legacy.initial.has(engineChunk)).toBe(false);
  const importers = [...legacy.dynamicTargets].filter(([, targets]) => targets.includes(engineChunk)).map(([name]) => name);
  expect(importers).toHaveLength(1);
  expect(importers[0]).toMatch(/^main-/);

  // Both builds load one initial file; the legacy one is larger, by the provider code.
  expect([...native.initial]).toEqual([expect.stringMatching(/^main-/)]);
  expect([...legacy.initial]).toEqual([expect.stringMatching(/^main-/)]);
  const size = (build: BuildChunks) => (build.files.get([...build.initial][0] ?? '') ?? '').length;
  expect(size(legacy)).toBeGreaterThan(size(native));
});

test('Section 9: animate.enter still runs in the build that provides the legacy engine', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(`${MOTION_ORIGIN}/legacy/`);
  await expect(page.getByRole('heading', { level: 1, name: 'Module 35 animations lab' })).toBeVisible();
  await page.getByRole('button', { name: 'Toggle message' }).click();

  const message = page.getByText('The message entered with a 400 ms fade.');
  await expect(message).toBeVisible();
  expect(await classesOf(message)).toContain('m35-fade-in');
  expect((await animationsOf(message)).map(({ kind }) => kind)).toEqual(['css-animation']);
  await finishAll(page);
  await expect.poll(() => classesOf(message)).not.toContain('m35-fade-in');
  await context.close();
});
