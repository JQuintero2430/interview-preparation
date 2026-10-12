import { MiniChangeDetector, View, type Mode } from './mini-change-detector';

// The literal table of Exercise 21.1, copied from
// labs/angular/src/app/modules/21-change-detection/exercise-1-render-meter/render-meter.spec.ts.
// This lab imports nothing from labs/angular: the copy is the contract.
const TABLE = {
  signalInLeaf: ['par-leaf'],
  markForCheck: ['par', 'par-eager', 'par-leaf', 'root'],
  click: ['par', 'par-eager', 'par-leaf', 'root'],
  newReference: ['par-eager', 'probe', 'root'],
  inPlaceEdit: ['par-eager', 'root'],
};

type Trigger = keyof typeof TABLE;

// The tree of Exercise 21.1: `par` and `sib` are OnPush, `par-eager` is Eager, `probe` is bound to `holder.data`.
function mount() {
  const holder = { data: { n: 1 } };
  const v = {
    root: new View('root', 'OnPush'),
    par: new View('par', 'OnPush'),
    parLeaf: new View('par-leaf', 'OnPush'),
    parEager: new View('par-eager', 'Eager'),
    parEagerLeaf: new View('par-eager-leaf', 'OnPush'),
    sib: new View('sib', 'OnPush'),
    probe: new View('probe', 'OnPush', () => holder.data),
  };
  v.par.add(v.parLeaf);
  v.parEager.add(v.parEagerLeaf);
  v.root.add(v.par, v.parEager, v.sib, v.probe);
  const detector = new MiniChangeDetector(v.root);
  detector.refreshTree('global');
  return { detector, holder, v };
}

const flagsOf = (views: View[]) =>
  views.map((view) => [view.name, view.dirty, view.refresh, view.hasChildToRefresh, view.consumerDirty]);

describe('E21.6 Model the tree walk and match the Angular meter', () => {
  it('global mode refreshes Eager nodes and flagged nodes and not clean OnPush nodes', () => {
    const { detector, v } = mount();
    expect(detector.refreshTree('global')).toEqual([]);

    detector.markForCheck(v.sib);
    expect(detector.refreshTree('global')).toEqual(['par-eager', 'root', 'sib']);
  });

  it('a signal change flags ancestors for traversal only and a targeted walk refreshes only the consumer', () => {
    const { detector, v } = mount();
    detector.signalChanged(v.parLeaf);

    expect(v.par.hasChildToRefresh && v.root.hasChildToRefresh).toBe(true);
    expect(v.par.refresh || v.par.dirty || v.root.refresh || v.root.dirty).toBe(false);
    expect(detector.refreshTree('targeted')).toEqual(['par-leaf']);
    expect(v.par.hasChildToRefresh || v.root.hasChildToRefresh || v.parLeaf.consumerDirty).toBe(false);
  });

  it('markForCheck flags the path to the root and a targeted walk refreshes all of it', () => {
    const { detector, v } = mount();
    detector.markForCheck(v.parLeaf);

    for (const view of [v.parLeaf, v.par, v.root]) {
      expect([view.refresh, view.dirty]).toEqual([true, true]);
    }
    expect(v.sib.refresh).toBe(false);
    const ran = detector.refreshTree('targeted');
    expect(ran).toEqual(expect.arrayContaining(['par-leaf', 'par', 'root']));
    expect(ran).not.toContain('sib');
  });

  it('an event flags like markForCheck and the walk below a refreshed node is global (the Eager sibling refreshes)', () => {
    const marked = mount();
    const clicked = mount();
    marked.detector.markForCheck(marked.v.parLeaf);
    clicked.detector.event(clicked.v.parLeaf);
    expect(flagsOf(Object.values(clicked.v))).toEqual(flagsOf(Object.values(marked.v)));

    const ran = clicked.detector.refreshTree('targeted');
    expect(ran).toContain('par-eager');
    expect(ran).not.toContain('sib');
    expect(ran).not.toContain('par-eager-leaf');
  });

  it('a detached node and its subtree are skipped and reattach restores the flags', () => {
    const { detector, v } = mount();
    detector.detach(v.par);
    detector.signalChanged(v.parLeaf);
    expect([v.par.hasChildToRefresh, v.root.hasChildToRefresh]).toEqual([true, false]);
    expect(detector.refreshTree('targeted')).toEqual([]);

    detector.markForCheck(v.parLeaf);
    expect(detector.refreshTree('targeted')).toEqual(['par-eager', 'root']);
    expect([v.par.refresh, v.parLeaf.consumerDirty]).toEqual([true, true]);

    detector.reattach(v.par);
    expect([v.par.attached, v.root.hasChildToRefresh]).toEqual([true, true]);
    expect(detector.refreshTree('targeted')).toEqual(['par', 'par-leaf']);
  });

  it('for the five triggers of Exercise 21.1 the model returns the same refreshed sets as the literal table', () => {
    const actions: Record<Trigger, (m: ReturnType<typeof mount>) => Mode> = {
      signalInLeaf: ({ detector, v }) => (detector.signalChanged(v.parLeaf), 'targeted'),
      markForCheck: ({ detector, v }) => (detector.markForCheck(v.parLeaf), 'targeted'),
      click: ({ detector, v }) => (detector.event(v.parLeaf), 'targeted'),
      newReference: ({ detector, holder, v }) => {
        holder.data = { n: 3 };
        detector.signalChanged(v.root);
        return 'targeted';
      },
      inPlaceEdit: ({ detector, holder, v }) => {
        holder.data.n = 2;
        detector.signalChanged(v.root);
        return 'targeted';
      },
    };

    const observed: Record<string, readonly string[]> = {};
    for (const trigger of Object.keys(TABLE) as Trigger[]) {
      const mounted = mount();
      observed[trigger] = mounted.detector.refreshTree(actions[trigger](mounted));
    }
    expect(observed).toEqual(TABLE);
  });
});
