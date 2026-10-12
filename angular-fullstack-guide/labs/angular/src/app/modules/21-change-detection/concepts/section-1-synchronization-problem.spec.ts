import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

// --- A recorder: the template method pushes its name, so a test can tell "evaluated" from "not evaluated" ---

const runs: string[] = [];

// --- A watcher: collects every mutation record, delivered or not, because the observer callback runs in a microtask ---

function watch(root: Node): { records: () => MutationRecord[]; stop: () => void } {
  const seen: MutationRecord[] = [];
  const observer = new MutationObserver((batch) => seen.push(...batch));
  observer.observe(root, { attributes: true, characterData: true, childList: true, subtree: true });
  return {
    records: () => [...seen, ...observer.takeRecords()],
    stop: () => observer.disconnect(),
  };
}

// --- An Eager fixture, on purpose: an Eager view is checked on every pass (the v22 default is OnPush) ---

@Component({
  selector: 'lab-m21-s1-eager-label',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<p>{{ label() }}</p>`,
})
class EagerLabel {
  protected readonly text = 'a';

  protected label(): string {
    runs.push('label');
    return this.text;
  }
}

// --- An OnPush fixture (no property needed): one binding changes, one does not ---

@Component({
  selector: 'lab-m21-s1-pair',
  template: `<p class="count">{{ count() }}</p>
    <p class="label">{{ label() }}</p>`,
})
class Pair {
  readonly count = signal(0);

  protected label(): string {
    runs.push('label');
    return 'a';
  }
}

describe('Section 1: the synchronization problem', () => {
  beforeEach(() => {
    runs.length = 0;
  });

  it('Section 1: refreshing an unchanged view evaluates its template and writes nothing', () => {
    const fixture = TestBed.createComponent(EagerLabel);
    fixture.detectChanges();
    const watcher = watch(fixture.nativeElement);

    for (let pass = 0; pass < 3; pass++) {
      const before = runs.length;
      fixture.detectChanges();
      expect(runs.length).toBeGreaterThan(before);
    }

    expect(watcher.records()).toHaveLength(0);
    expect(fixture.nativeElement.textContent).toBe('a');
    watcher.stop();
  });

  it('Section 1: a changed binding is the only DOM write', async () => {
    const fixture = TestBed.createComponent(Pair);
    fixture.detectChanges();
    const watcher = watch(fixture.nativeElement);
    runs.length = 0;

    fixture.componentInstance.count.set(1);
    await fixture.whenStable();

    const records = watcher.records();
    expect(records).toHaveLength(1);
    expect(records[0].type).toBe('characterData');
    expect(records[0].target).toBe(fixture.nativeElement.querySelector('.count').firstChild);
    expect(fixture.nativeElement.querySelector('.count').textContent).toBe('1');
    expect(runs).toContain('label');
    watcher.stop();
  });
});
