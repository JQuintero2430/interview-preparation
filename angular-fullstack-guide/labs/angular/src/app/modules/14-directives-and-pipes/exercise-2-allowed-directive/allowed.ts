import {
  Directive,
  effect,
  inject,
  Injectable,
  input,
  signal,
  Signal,
  TemplateRef,
  untracked,
  ViewContainerRef,
} from '@angular/core';

/** The signed-in user's roles; a stand-in for a permission backend. */
@Injectable({ providedIn: 'root' })
export class CurrentRoles {
  readonly roles = signal<readonly string[]>([]);
}

export interface AllowedContext {
  readonly $implicit: readonly string[];
  readonly role: string;
}

class SignalContext implements AllowedContext {
  constructor(
    private readonly roles: Signal<readonly string[]>,
    private readonly key: Signal<string>,
  ) {}
  get $implicit(): readonly string[] {
    return this.roles();
  }
  get role(): string {
    return this.key();
  }
}

type Shown = 'main' | 'else' | 'none';

@Directive({ selector: '[labAllowed]' })
export class Allowed {
  readonly labAllowed = input.required<string>();
  readonly labAllowedElse = input<TemplateRef<unknown> | null>(null);

  private readonly template = inject<TemplateRef<AllowedContext>>(TemplateRef);
  private readonly container = inject(ViewContainerRef);
  private readonly current = inject(CurrentRoles);
  private shown: Shown = 'none';
  private elseTemplate: TemplateRef<unknown> | null = null;

  // One context object per directive: its getters read the signals, so the view always reads fresh values.
  private readonly context: AllowedContext = new SignalContext(this.current.roles, this.labAllowed);

  constructor() {
    effect(() => {
      const allowed = this.current.roles().includes(this.labAllowed());
      const elseTemplate = this.labAllowedElse();
      untracked(() => this.render(allowed, elseTemplate));
    });
  }

  // Compile-time only: the template type checker reads this signature; the body never runs.
  static ngTemplateContextGuard(_directive: Allowed, _context: unknown): _context is AllowedContext {
    return true;
  }

  private render(allowed: boolean, elseTemplate: TemplateRef<unknown> | null): void {
    const next: Shown = allowed ? 'main' : elseTemplate ? 'else' : 'none';
    if (next === this.shown && elseTemplate === this.elseTemplate) {
      return;
    }
    this.container.clear();
    if (next === 'main') {
      this.container.createEmbeddedView(this.template, this.context);
    } else if (next === 'else') {
      this.container.createEmbeddedView(elseTemplate!);
    }
    this.shown = next;
    this.elseTemplate = elseTemplate;
  }
}
