// Section 5 model: how the nginx image renders a template from the environment, and how our own config writer refuses to
// start. Our model, not the nginx image's script. It mirrors nginx/docker-nginx `entrypoint/20-envsubst-on-templates.sh`
// and the `nginx/docker-nginx-unprivileged` copy (both read 2026-10-22, F12): the script collects the names of the
// environment variables whose names match NGINX_ENVSUBST_FILTER (an awk regular expression; empty matches every name),
// formats them as "${NAME} " and passes that list to `envsubst`. GNU gettext's `envsubst` (the "Invoking the envsubst
// program" page and `envsubst.c`, read 2026-10-22) then replaces `$NAME` and `${NAME}` only for the listed names and
// copies everything else as written; with no list it replaces every referenced name, an unset one by nothing. The two
// images build the awk test differently (`name ~ filter` against `name ~ /${filter}/`), which agrees for a plain
// pattern; a JavaScript RegExp stands in for awk's. Not modeled: awk's dialect of regular expressions, `NGINX_ENVSUBST_*`
// directory and suffix settings, the `*.envsh` and stream templates, file writes. `writeConfig` models
// labs/angular/deploy/docker-entrypoint.d/40-write-config.sh (ours, not the image's): it lists every missing or empty
// required variable and refuses, as the script does with a non-zero exit. Nothing here reads a file, a clock or the network.

/** The environment a container starts with: variable names to values. */
export type Environment = Readonly<Record<string, string>>;

/** `$NAME` or `${NAME}`, with envsubst's name rule: a letter or "_", then letters, digits or "_". */
const REFERENCE = /\$(?:\{([A-Za-z_][A-Za-z0-9_]*)\}|([A-Za-z_][A-Za-z0-9_]*))/g;

function nameOf(braced: string | undefined, bare: string | undefined): string {
  return braced ?? bare ?? '';
}

/** The names the template step lists for `envsubst`: defined variables whose names match the filter ("" matches all). */
export function definedNames(env: Environment, filter = ''): readonly string[] {
  const pattern = new RegExp(filter);
  return Object.keys(env).filter((name) => pattern.test(name));
}

/**
 * `envsubst "${A} ${B}"`: replaces `$NAME` and `${NAME}` for the defined, filtered names; any other text, `$uri` and an
 * unset `${UNSET}` included, stays as written.
 */
export function renderTemplate(text: string, env: Environment, filter = ''): string {
  const listed = new Set(definedNames(env, filter));
  return text.replace(REFERENCE, (reference, braced: string | undefined, bare: string | undefined) => {
    const name = nameOf(braced, bare);
    return listed.has(name) ? (env[name] ?? '') : reference;
  });
}

/** `envsubst` run by hand with no list: every referenced name is replaced, an unset one by the empty string. */
export function substituteAll(text: string, env: Environment): string {
  return text.replace(REFERENCE, (_reference, braced: string | undefined, bare: string | undefined) => {
    return env[nameOf(braced, bare)] ?? '';
  });
}

/** Names in `required` that are unset or empty, in the order given. */
export function missingVariables(env: Environment, required: readonly string[]): readonly string[] {
  return required.filter((name) => (env[name] ?? '') === '');
}

/** The outcome of our writer: the body to write, or the refusal that stops the container's start. */
export type WriteResult =
  | { readonly kind: 'written'; readonly body: string }
  | { readonly kind: 'refused'; readonly missing: readonly string[]; readonly message: string };

/**
 * Our writer: every name in `required` must be set and non-empty; the template is then rendered with exactly those
 * names (an explicit list, not the whole environment), so nothing else in the environment can leak into the file.
 */
export function writeConfig(template: string, env: Environment, required: readonly string[]): WriteResult {
  const missing = missingVariables(env, required);
  if (missing.length > 0) {
    return { kind: 'refused', missing, message: `40-write-config.sh: required variables not set or empty: ${missing.join(' ')}` };
  }
  const listed = Object.fromEntries(required.map((name) => [name, env[name] ?? '']));
  return { kind: 'written', body: renderTemplate(template, listed) };
}
