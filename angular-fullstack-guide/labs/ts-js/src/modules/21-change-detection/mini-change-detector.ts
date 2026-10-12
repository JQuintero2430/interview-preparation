// labs/ts-js/src/modules/21-change-detection/mini-change-detector.ts
// A teaching model of the view-tree walk behind Angular change detection. A view is a node with flags;
// the names follow the internal flags of the v22.2.1 source (Dirty, RefreshView, HasChildViewsToRefresh).
// Simplifications: one view per component, no embedded views, no zone, no scheduler, no development pass.

export type Strategy = 'OnPush' | 'Eager';
export type Mode = 'global' | 'targeted';

export class View {
  readonly children: View[] = [];
  parent: View | undefined;
  dirty: boolean;
  refresh = false;
  hasChildToRefresh = false;
  consumerDirty = false;
  attached = true;
  input: unknown;

  constructor(
    readonly name: string,
    readonly strategy: Strategy,
    readonly bind?: () => unknown,
  ) {
    this.dirty = strategy === 'OnPush'; // a new OnPush view starts dirty, so its first walk renders it
  }

  add(...views: View[]): this {
    for (const view of views) {
      view.parent = this;
      this.children.push(view);
    }
    return this;
  }
}

const requiresRefreshOrTraversal = (view: View): boolean =>
  view.refresh || view.hasChildToRefresh || view.consumerDirty;

export class MiniChangeDetector {
  constructor(private readonly root: View) {}

  /** The path of `markForCheck` and of an event handler: the view and every ancestor. */
  markViewDirty(view: View): void {
    for (let v: View | undefined = view; v; v = v.parent) {
      v.refresh = true;
      v.dirty = true;
    }
  }

  markForCheck(view: View): void {
    this.markViewDirty(view);
  }

  event(view: View): void {
    this.markViewDirty(view);
  }

  /** A signal read by the view's template changed: flag the view's consumer, then the ancestors. */
  signalChanged(view: View): void {
    view.consumerDirty = true;
    this.markAncestorsForTraversal(view);
  }

  detach(view: View): void {
    view.attached = false;
  }

  reattach(view: View): void {
    if (view.dirty) {
      view.refresh = true;
    }
    if (requiresRefreshOrTraversal(view)) {
      this.markAncestorsForTraversal(view);
    }
    view.attached = true;
  }

  /** One walk from the root; returns the names of the views whose template ran, sorted. */
  refreshTree(mode: Mode): readonly string[] {
    const ran: string[] = [];
    this.visit(this.root, mode, ran);
    return ran.sort();
  }

  private markAncestorsForTraversal(view: View): void {
    for (let p = view.parent; p && !p.hasChildToRefresh; p = p.parent) {
      p.hasChildToRefresh = true;
      if (!p.attached) {
        return;
      }
    }
  }

  private visit(view: View, mode: Mode, ran: string[]): void {
    if (!view.attached) {
      return;
    }
    const global = mode === 'global' && (view.strategy === 'Eager' || view.dirty);
    const shouldRefresh = global || view.refresh || view.consumerDirty;
    const traverse = view.hasChildToRefresh;
    view.refresh = false;
    view.hasChildToRefresh = false;
    view.consumerDirty = false;
    if (shouldRefresh) {
      this.refreshView(view, ran);
    } else if (traverse) {
      this.visitChildren(view, 'targeted', ran);
    }
  }

  private refreshView(view: View, ran: string[]): void {
    ran.push(view.name);
    view.children.forEach((child) => this.bindInput(child));
    this.visitChildren(view, 'global', ran);
    view.dirty = false;
  }

  private visitChildren(view: View, mode: Mode, ran: string[]): void {
    view.children.forEach((child) => this.visit(child, mode, ran));
  }

  private bindInput(child: View): void {
    if (!child.bind) {
      return;
    }
    const next = child.bind();
    if (!Object.is(child.input, next)) {
      child.input = next;
      child.dirty ||= child.strategy === 'OnPush';
    }
  }
}
