// Section 5 claims, about our model (envsubst-model.ts) and the committed deploy files read as text: only defined,
// filtered names are substituted, so Nginx's own variables survive the template step; our config writer refuses to start
// without a required variable; one template gives different config.json bodies per environment; and the script, the
// template, the Dockerfile and the Nginx template agree on names and paths. No shell, container or Nginx runs here.
import { headerValues, readServer, respond } from './nginx-model';
import { definedNames, missingVariables, renderTemplate, substituteAll, writeConfig } from './envsubst-model';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const fs: { readFileSync(path: URL, encoding: 'utf8'): string } = await import(fsSpecifier);
const readDeployFile = (name: string): string =>
  fs.readFileSync(new URL(`../../../../../angular/deploy/${name}`, import.meta.url), 'utf8');

const nginxTemplate = readDeployFile('nginx/default.conf.template');
const configTemplate = readDeployFile('config/config.json.template');
const script = readDeployFile('docker-entrypoint.d/40-write-config.sh');
const dockerfile = readDeployFile('Dockerfile');

/** The names a template references as ${NAME}, in order of first appearance. */
const referencedNames = (text: string): readonly string[] => [
  ...new Set([...text.matchAll(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g)].map((match) => match[1] ?? '')),
];
/** The names the script checks, in order: the first argument of each `check NAME "${NAME:-}"` line. */
const checkedNames = (): readonly string[] => [...script.matchAll(/^check ([A-Z_]+) /gm)].map((match) => match[1] ?? '');
const scriptValue = (variable: string): string => script.match(new RegExp(`^${variable}=(\\S+)$`, 'm'))?.[1] ?? '';

const staging = {
  API_URL: 'https://api.staging.example.com',
  FEATURE_FLAGS_URL: 'https://flags.staging.example.com',
  RELEASE: '2026.10.22-staging',
  TRACE_SAMPLE_RATE: '1',
};
const production = {
  API_URL: 'https://api.example.com',
  FEATURE_FLAGS_URL: 'https://flags.example.com',
  RELEASE: '2026.10.22',
  TRACE_SAMPLE_RATE: '0.1',
};

describe('Module 44 · section 5', () => {
  it('Section 5: only listed defined variables are substituted, as $NAME or ${NAME}, so $uri and an unset variable stay as written', () => {
    const text = 'api=${API_URL} path=$uri missing=${UNSET} home=${HOME}';
    const env = { API_URL: 'https://api.example.com', HOME: '/root' };
    expect(renderTemplate(text, env)).toBe('api=https://api.example.com path=$uri missing=${UNSET} home=/root');
    // A listed name is replaced in both forms (GNU envsubst); a name that is not defined never reaches the list.
    expect(renderTemplate('$API_URL and ${API_URL}', env)).toBe('https://api.example.com and https://api.example.com');
    // The committed Nginx template references no environment variable, so the template step leaves it unchanged.
    expect(nginxTemplate).toContain('$uri');
    expect(renderTemplate(nginxTemplate, env)).toBe(nginxTemplate);
    // Run by hand with no list, envsubst replaces every reference, an unset one by nothing: this is what breaks configs.
    expect(substituteAll('try_files $uri /index.html;', env)).toBe('try_files  /index.html;');
  });

  it('Section 5: a filter limits substitution to matching names', () => {
    const env = { API_URL: 'https://api.example.com', API_KEY_ID: 'k1', HOME: '/root' };
    expect(definedNames(env)).toEqual(['API_URL', 'API_KEY_ID', 'HOME']);
    expect(definedNames(env, '^API_')).toEqual(['API_URL', 'API_KEY_ID']);
    expect(renderTemplate('${API_URL} ${HOME}', env, '^API_')).toBe('https://api.example.com ${HOME}');
  });

  it('Section 5: our config writer refuses to start when a required variable is missing', () => {
    const required = Object.keys(staging);
    expect(missingVariables({ ...staging, RELEASE: '' }, required)).toEqual(['RELEASE']);
    const refused = writeConfig(configTemplate, { API_URL: staging.API_URL }, required);
    expect(refused).toEqual({
      kind: 'refused',
      missing: ['FEATURE_FLAGS_URL', 'RELEASE', 'TRACE_SAMPLE_RATE'],
      message: '40-write-config.sh: required variables not set or empty: FEATURE_FLAGS_URL RELEASE TRACE_SAMPLE_RATE',
    });
    // The committed script checks the names the template references, collects the failures and exits non-zero.
    expect(checkedNames()).toEqual(referencedNames(configTemplate));
    expect(script).toContain('set -eu');
    expect(script).toMatch(/exit 1\n/);
    expect(script).toContain(`envsubst '${referencedNames(configTemplate).map((name) => `\${${name}}`).join(' ')}'`);
  });

  it('Section 5: one template renders different config.json bodies for staging and production', () => {
    const required = referencedNames(configTemplate);
    const render = (env: Record<string, string>): Record<string, unknown> => {
      const result = writeConfig(configTemplate, { ...env, HOME: '/root' }, required);
      return result.kind === 'written' ? JSON.parse(result.body) : {};
    };
    expect(render(staging)).toEqual({
      apiUrl: 'https://api.staging.example.com',
      featureFlagsUrl: 'https://flags.staging.example.com',
      release: '2026.10.22-staging',
      traceSampleRate: 1,
    });
    expect(render(production)).toMatchObject({ apiUrl: 'https://api.example.com', traceSampleRate: 0.1 });

    // The files agree: the Dockerfile copies the template and the script where the script looks for them, and the
    // Nginx template serves, with no-store, the file the script writes.
    expect(dockerfile).toContain(`COPY deploy/config/config.json.template ${scriptValue('TEMPLATE')}`);
    expect(dockerfile).toContain('--chmod=755 deploy/docker-entrypoint.d/40-write-config.sh /docker-entrypoint.d/40-write-config.sh');
    const written = `${scriptValue('OUTPUT_DIR')}/config.json`;
    const response = respond(readServer(nginxTemplate), { uri: '/config.json' }, new Set([written]));
    expect(response.status).toBe(200);
    expect(response.file).toBe(written);
    expect(headerValues(response, 'Cache-Control')).toEqual(['no-store']);
  });
});
