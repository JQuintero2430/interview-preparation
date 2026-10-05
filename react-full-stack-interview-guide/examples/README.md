# Companion Examples

This is the runnable code behind the guide. Every non-trivial snippet in a module lives here, and the module names the file path.

| Folder | What | Used by |
|---|---|---|
| `web/` | Vite + React 19 + TypeScript, Vitest + React Testing Library + user-event + jest-dom + MSW | Modules 01–20, 22, 24–26 |
| `next-rsc/` | Next.js sub-project for Server Components and Server Actions (added with module 21) | Module 21 |
| `spring-api/` | Minimal Spring Boot API (added with module 24) | Module 24 |
| `scripts/check-links.mjs` | Checks every relative link and `#anchor` in the guide, and that every `// file:` code block matches its file exactly | Maintenance |

## Node version

`examples/.nvmrc` pins **Node 24 (LTS)**. Vitest 5 supports Node `^22.12 || ^24 || >=26`, so the odd-numbered "Current" release Node 25 is outside its range.

### Install Node 24 on macOS (one time)

Pick **one** version manager. Both read `examples/.nvmrc`.

**fnm** (fast, Rust-based):
```bash
brew install fnm
echo 'eval "$(fnm env --use-on-cd --shell zsh)"' >> ~/.zshrc   # auto-switch on cd
source ~/.zshrc
fnm install 24
```

**nvm**:
```bash
brew install nvm
mkdir -p ~/.nvm
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$(brew --prefix nvm)/nvm.sh" ] && . "$(brew --prefix nvm)/nvm.sh"' >> ~/.zshrc
source ~/.zshrc
nvm install 24
```
(nvm's maintainers recommend their own install script over Homebrew; either works here.)

### Use it

```bash
cd examples
fnm use            # or: nvm use. Both read .nvmrc (24)
node -v            # v24.x
```

A Homebrew `node` (25.x) can stay installed. In shells where a version manager is active, its Node comes first on `PATH`.

## Run the web examples

```bash
cd examples/web
npm ci             # installs exactly what package-lock.json records
npm run verify     # type-check + lint + all tests
npm test           # tests only
npx vitest run src/m09-effects   # one module's tests
npm run dev        # Vite dev server, if you want to click around
```

Each module's code is in `web/src/mNN-<slug>/`. The tests sit next to the code as `*.test.ts(x)`.

## Run the Next.js examples (module 21)

```bash
cd examples/next-rsc
npm ci
npm run verify     # type-check + next build
npm run dev        # http://localhost:3000
```

Next.js 16.3.8, App Router. Each example is a route folder under `next-rsc/app/`. TypeScript is pinned to ~6.0.3 to match `web/`.

## Run the Spring Boot API (module 24)

```bash
cd examples/spring-api
mvn verify            # 53 tests
mvn spring-boot:run   # http://localhost:8080/api/projects
```

Spring Boot 4.1.1 on JDK 21. CORS allows http://localhost:5173 (the Vite dev server). See `spring-api/README.md` for curl examples.

## Check the guide's links and inline code

```bash
node examples/scripts/check-links.mjs                  # strict: every link must resolve
node examples/scripts/check-links.mjs --allow-missing  # while modules are still being written
```

## Toolchain pins (and why)

The tools are the latest stable releases as of 2026-10-03 ([VERSIONS.md](../VERSIONS.md)), with one exception: **TypeScript is pinned to 6.0.x**. TypeScript 7.0 (the Go-native compiler) is out, but `typescript-eslint` 8.71 only supports `typescript >=4.8.4 <6.1.0`. Module 02 still teaches TypeScript 7.
