import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { LegacyDestroySubject } from '../legacy/destroy-subject/legacy-destroy-subject';

const log: string[] = [];
const source = new Subject<number>();

// --- A component with every teardown route, registered in a known order ---

@Component({ selector: 'lab-m20-s5-teardown', template: `{{ tick() }}` })
class Teardown {
  readonly tick = signal(0);
  readonly ref = inject(DestroyRef);

  constructor() {
    this.ref.onDestroy(() => log.push('onDestroy cb1'));
    source.pipe(takeUntilDestroyed()).subscribe({
      next: (value) => log.push(`next ${value}`),
      complete: () => log.push('completed by takeUntilDestroyed'),
    });
    this.ref.onDestroy(() => log.push('onDestroy cb2'));
    effect((onCleanup) => {
      this.tick();
      onCleanup(() => log.push('effect cleanup'));
    });
  }

  ngOnDestroy(): void {
    log.push('ngOnDestroy');
  }
}

@Component({
  selector: 'lab-m20-s5-host',
  imports: [Teardown],
  template: `@if (on()) {<lab-m20-s5-teardown />}`,
})
class Host {
  readonly on = signal(true);
}

@Component({
  selector: 'lab-m20-s5-legacy-host',
  imports: [LegacyDestroySubject],
  template: `<lab-m20-legacy-destroy-subject [source]="source" />`,
})
class LegacyHost {
  readonly source = source;
}

describe('Section 5: teardown', () => {
  beforeEach(() => {
    log.length = 0;
  });

  it('Section 5: ngOnDestroy, DestroyRef callbacks and effect cleanups run in a fixed order', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    expect(log).toEqual([]);

    fixture.componentInstance.on.set(false);
    fixture.detectChanges();
    expect(log).toEqual([
      'ngOnDestroy',
      'onDestroy cb1',
      'completed by takeUntilDestroyed',
      'onDestroy cb2',
      'effect cleanup',
    ]);
  });

  it('Section 5: takeUntilDestroyed completes the stream at destroy and not before', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    source.next(1);
    expect(log).toEqual(['next 1']);
    expect(source.observed).toBe(true);

    fixture.destroy();
    expect(log).toContain('completed by takeUntilDestroyed');
    expect(source.observed).toBe(false);
    log.length = 0;
    source.next(2);
    expect(log).toEqual([]);
  });

  it('Section 5: takeUntilDestroyed outside an injection context throws NG0203', () => {
    let message = '';
    try {
      takeUntilDestroyed();
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('NG0203: takeUntilDestroyed() can only be used within an injection context');
  });

  it('Section 5: takeUntilDestroyed with a destroyed DestroyRef completes at once', () => {
    const fixture = TestBed.createComponent(Teardown);
    const ref = fixture.componentInstance.ref;
    fixture.destroy();

    let completed = false;
    new Subject<number>().pipe(takeUntilDestroyed(ref)).subscribe({ complete: () => (completed = true) });
    expect(completed).toBe(true);
  });

  it('Section 5: onDestroy on a destroyed component reference throws NG0911 and destroyed is true', () => {
    const fixture = TestBed.createComponent(Teardown);
    const ref = fixture.componentInstance.ref;
    expect(ref.destroyed).toBe(false);
    fixture.destroy();
    expect(ref.destroyed).toBe(true);
    expect(TestBed.inject(DestroyRef).destroyed).toBe(false);

    let message = '';
    try {
      ref.onDestroy(() => log.push('late'));
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('NG0911: View has already been destroyed.');
    expect(log).not.toContain('late');
  });

  it('Section 5: a callback removed with its unregister function never runs', () => {
    const fixture = TestBed.createComponent(Teardown);
    const off = fixture.componentInstance.ref.onDestroy(() => log.push('removed'));
    off();
    fixture.destroy();
    expect(log).not.toContain('removed');
    expect(log).toContain('onDestroy cb1');
  });

  it('Section 5: the legacy Subject pattern unsubscribes at destroy', () => {
    const fixture = TestBed.createComponent(LegacyHost);
    fixture.detectChanges();
    source.next(1);
    expect(source.observed).toBe(true);
    fixture.destroy();
    expect(source.observed).toBe(false);
  });
});
