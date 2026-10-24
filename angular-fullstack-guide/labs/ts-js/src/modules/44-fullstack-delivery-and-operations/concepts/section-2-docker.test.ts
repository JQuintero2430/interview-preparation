// Section 2 claims, about our model (docker-cache-model.ts) and the committed deploy files read as text: a changed
// layer rebuilds every later one, so the lockfile and `npm ci` come before the sources; the runtime stage copies only
// the browser output and runs as a non-root user. Docker is never run here; the files are read, not executed.
import { parseStages, rebuiltSteps, type Step } from './docker-cache-model';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const fs: { readFileSync(path: URL, encoding: 'utf8'): string } = await import(fsSpecifier);
const readDeployFile = (name: string): string =>
  fs.readFileSync(new URL(`../../../../../angular/deploy/${name}`, import.meta.url), 'utf8');

const copyManifest: Step = { instruction: 'COPY package.json package-lock.json ./', sources: ['package.json', 'package-lock.json'] };
const install: Step = { instruction: 'RUN npm ci', sources: [] };
const copySources: Step = { instruction: 'COPY . .', sources: ['.'] };
const build: Step = { instruction: 'RUN npx ng build', sources: [] };

describe('Module 44 · section 2', () => {
  it('Section 2: our cache model reuses the npm ci layer when only a source file changes', () => {
    const steps = [copyManifest, install, copySources, build];
    expect(rebuiltSteps(steps, ['src/app/app.ts'])).toEqual([copySources.instruction, build.instruction]);
    expect(rebuiltSteps(steps, [])).toEqual([]);
    expect(rebuiltSteps(steps, ['package-lock.json'])).toEqual(steps.map((step) => step.instruction));
  });

  it('Section 2: copying the sources before npm ci reruns npm ci on every source change', () => {
    const steps = [copySources, install, build];
    expect(rebuiltSteps(steps, ['src/app/app.ts'])).toEqual([copySources.instruction, install.instruction, build.instruction]);
  });

  it('Section 2: the committed Dockerfile copies the lockfile and runs npm ci before copying the sources', () => {
    const [buildStage] = parseStages(readDeployFile('Dockerfile'));
    const instructions = (buildStage?.steps ?? []).map((step) => step.instruction);
    const manifest = instructions.findIndex((line) => line.startsWith('COPY package.json package-lock.json'));
    const npmCi = instructions.findIndex((line) => line.startsWith('RUN --mount=type=cache,target=/root/.npm npm ci'));
    const sources = instructions.indexOf('COPY . .');
    expect(manifest).toBeGreaterThanOrEqual(0);
    expect(npmCi).toBeGreaterThan(manifest);
    expect(sources).toBeGreaterThan(npmCi);
    // The committed order, replayed through our model: a source edit leaves the npm ci layer cached.
    const sourceEdit = rebuiltSteps(buildStage?.steps ?? [], ['src/app/app.ts']);
    expect(sourceEdit).not.toContain(instructions[npmCi]);
    expect(rebuiltSteps(buildStage?.steps ?? [], ['package-lock.json'])).toContain(instructions[npmCi]);
    const ignored = readDeployFile('Dockerfile.dockerignore').split('\n');
    expect(ignored).toEqual(expect.arrayContaining(['node_modules', 'dist', '.angular', '.git']));
  });

  it('Section 2: the committed runtime stage copies only the browser output and runs as a non-root user', () => {
    const dockerfile = readDeployFile('Dockerfile');
    const stages = parseStages(dockerfile);
    expect(stages.map((stage) => stage.name)).toEqual(['build', undefined]);
    const runtime = stages[1];
    expect(runtime?.base).toMatch(/^nginx\/nginx-unprivileged:/);
    const fromBuild = (runtime?.steps ?? []).filter((step) => step.instruction.startsWith('COPY --from='));
    expect(fromBuild.map((step) => step.instruction)).toEqual(['COPY --from=build /app/dist/labs/browser/ /usr/share/nginx/html/']);
    const users = (runtime?.steps ?? []).filter((step) => step.instruction.startsWith('USER '));
    expect(users.map((step) => step.instruction)).toEqual(['USER 101']);
    expect(runtime?.steps.map((step) => step.instruction)).toContain('EXPOSE 8080');
    // No build argument, so no environment's API URL is baked into the image.
    expect(dockerfile).not.toMatch(/^ARG /m);
  });
});
