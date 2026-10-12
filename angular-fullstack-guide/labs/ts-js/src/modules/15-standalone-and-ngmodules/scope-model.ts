// Exercise 15.4: a MODEL of the NgModule compilation-scope rules read and observed in Angular 22.2.1 (module 15
// sections 1, 2, 5 and 8), not Angular's compiler. The codes are borrowed names; the messages are the model's own.
// Not covered: pipes versus directives (everything is a name with a selector), `schemas`, providers, `forwardRef`,
// JIT, NgModules in a module's `declarations`, and the cascade errors Angular adds after a cycle.

export interface ComponentUnit {
  readonly kind: "component";
  readonly name: string;
  readonly selector: string;
  readonly standalone: boolean;
  readonly imports?: readonly string[];
  readonly uses?: readonly string[];
}

export interface ModuleUnit {
  readonly kind: "module";
  readonly name: string;
  readonly declarations?: readonly string[];
  readonly imports?: readonly string[];
  readonly exports?: readonly string[];
}

export type Unit = ComponentUnit | ModuleUnit;

export type Code =
  "NG6002" | "NG6004" | "NG6007" | "NG6008" | "NG2011" | "NG8001";

export interface Diagnostic {
  readonly code: Code;
  readonly classes: readonly string[];
  readonly message: string;
}

export interface ScopeResult {
  readonly scopes: Readonly<Record<string, readonly string[]>>;
  readonly diagnostics: readonly Diagnostic[];
}

class Program {
  readonly components = new Map<string, ComponentUnit>();
  readonly modules = new Map<string, ModuleUnit>();
  readonly declaredBy = new Map<string, string[]>();
  readonly diagnostics: Diagnostic[] = [];

  constructor(units: readonly Unit[]) {
    for (const unit of units) {
      if (unit.kind === "module") this.modules.set(unit.name, unit);
      else this.components.set(unit.name, unit);
    }
    for (const mod of this.modules.values()) {
      for (const name of mod.declarations ?? []) {
        this.declaredBy.set(name, [
          ...(this.declaredBy.get(name) ?? []),
          mod.name,
        ]);
      }
    }
  }

  report(code: Code, classes: readonly string[], message: string): void {
    this.diagnostics.push({ code, classes, message });
  }

  // What a module contributes to whoever imports it: its exported components and, transitively, the exports of the
  // modules it exports. `seen` makes a cycle of exports terminate.
  exportedBy(moduleName: string, seen = new Set<string>()): string[] {
    const mod = this.modules.get(moduleName);
    if (!mod || seen.has(moduleName)) return [];
    seen.add(moduleName);
    return (mod.exports ?? []).flatMap((name) =>
      this.modules.has(name) ? this.exportedBy(name, seen) : [name],
    );
  }

  // What an `imports` entry brings into a template: a module's exports, or the class itself.
  importedBy(names: readonly string[]): string[] {
    return names.flatMap((name) =>
      this.modules.has(name) ? this.exportedBy(name) : [name],
    );
  }

  scopeOf(component: ComponentUnit): string[] {
    if (component.standalone) {
      const imported = (component.imports ?? []).filter(
        (name) => this.components.get(name)?.standalone !== false,
      );
      return [component.name, ...this.importedBy(imported)];
    }
    const mod = this.modules.get(
      this.declaredBy.get(component.name)?.[0] ?? "",
    );
    return [
      ...(mod?.declarations ?? []),
      ...this.importedBy(mod?.imports ?? []),
    ];
  }
}

function checkCycles(program: Program): void {
  const done = new Set<string>();
  const visit = (name: string, path: string[]): void => {
    if (path.includes(name)) {
      const cycle = path.slice(path.indexOf(name));
      program.report(
        "NG6002",
        cycle,
        `the imports of ${cycle.join(" -> ")} -> ${name} form a cycle`,
      );
      return;
    }
    if (done.has(name)) return;
    const next = (program.modules.get(name)?.imports ?? []).filter((imported) =>
      program.modules.has(imported),
    );
    next.forEach((imported) => visit(imported, [...path, name]));
    done.add(name);
  };
  [...program.modules.keys()].forEach((name) => visit(name, []));
}

function checkDeclarations(program: Program): void {
  for (const [name, modules] of program.declaredBy) {
    if (modules.length > 1)
      program.report(
        "NG6007",
        [name, ...modules],
        `${name} is declared by ${modules.join(" and ")}`,
      );
    if (program.components.get(name)?.standalone) {
      modules.forEach((mod) =>
        program.report(
          "NG6008",
          [name, mod],
          `${mod} declares the standalone ${name}`,
        ),
      );
    }
  }
}

function checkExports(program: Program): void {
  for (const mod of program.modules.values()) {
    const allowed = new Set([
      ...(mod.declarations ?? []),
      ...(mod.imports ?? []),
    ]);
    const stray = (mod.exports ?? []).filter(
      (name) => !program.modules.has(name) && !allowed.has(name),
    );
    stray.forEach((name) =>
      program.report(
        "NG6004",
        [mod.name, name],
        `${mod.name} exports ${name}, neither declared nor imported`,
      ),
    );
  }
}

function checkStandaloneImports(program: Program): void {
  for (const component of program.components.values()) {
    if (!component.standalone) continue;
    const declaredOnly = (component.imports ?? []).filter(
      (name) => program.components.get(name)?.standalone === false,
    );
    declaredOnly.forEach((name) =>
      program.report(
        "NG2011",
        [component.name, name],
        `${component.name} imports ${name}, which is not standalone`,
      ),
    );
  }
}

function checkTemplates(
  program: Program,
  scopes: Record<string, readonly string[]>,
): void {
  for (const component of program.components.values()) {
    const known = new Set(
      (scopes[component.name] ?? []).map(
        (name) => program.components.get(name)?.selector,
      ),
    );
    const unknown = (component.uses ?? []).filter(
      (selector) => !known.has(selector),
    );
    unknown.forEach((selector) =>
      program.report(
        "NG8001",
        [component.name, selector],
        `${selector} is not in the scope of ${component.name}`,
      ),
    );
  }
}

export function computeScopes(units: readonly Unit[]): ScopeResult {
  const program = new Program(units);
  const scopes: Record<string, readonly string[]> = {};
  for (const component of program.components.values()) {
    scopes[component.name] = [...new Set(program.scopeOf(component))].sort();
  }
  checkCycles(program);
  checkDeclarations(program);
  checkExports(program);
  checkStandaloneImports(program);
  checkTemplates(program, scopes);
  return { scopes, diagnostics: program.diagnostics };
}
