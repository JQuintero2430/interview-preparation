import {
  afterNextRender,
  ApplicationRef,
  Component,
  DestroyRef,
  inject,
  NgZone,
  provideCheckNoChangesConfig,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';
import { ZoneEraBoard } from '../legacy/zone-era-board/zone-era-board';

// --- OnPush (the v22 default) with a plain field: the board once `Eager` is dropped and nothing announces its writes ---

@Component({ selector: 'lab-m21-s6-plain-board', template: `<p class="open">{{ open }}</p>` })
class PlainBoard {
  open = 0;
}

// --- The migrated board: signals for what the template shows, a render hook for what ran after `onStable` ---

@Component({
  selector: 'lab-m21-s6-signal-board',
  template: `<p class="open">{{ open() }}</p>
    <p class="status">{{ status() }}</p>`,
})
class SignalBoard {
  private readonly destroyRef = inject(DestroyRef);
  readonly open = signal(0);
  readonly status = signal('loading');

  constructor() {
    afterNextRender(() => this.status.set('ready'));
  }

  watch(tickets: Observable<number>): void {
    tickets.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((count) => this.open.set(count));
  }
}

const settleTimers = () => new Promise<void>((resolve) => setTimeout(resolve, 20));

describe('Section 6: migrating a zone-based app to zoneless', () => {
  it('Section 6: an exhaustive check reports a plain-field write that no notification announced', async () => {
    TestBed.configureTestingModule({
      providers: [provideCheckNoChangesConfig({ exhaustive: true })],
    });
    const fixture = TestBed.createComponent(PlainBoard);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.open = 3;

    expect(() => TestBed.inject(ApplicationRef).tick()).toThrowError(
      /NG0100.*Previous value: '0'\. Current value: '3'/s,
    );
  });

  it('Section 6: the same component rendered after switching the field to a signal', async () => {
    const before = new Subject<number>();
    const legacy = TestBed.createComponent(ZoneEraBoard);
    legacy.componentInstance.watch(before);
    legacy.detectChanges();
    await legacy.whenStable();

    before.next(3);
    await legacy.whenStable();
    await settleTimers();
    expect(legacy.componentInstance.open).toBe(3);
    expect(legacy.nativeElement.querySelector('.open').textContent).toBe('0');
    legacy.destroy();

    const after = new Subject<number>();
    const migrated = TestBed.createComponent(SignalBoard);
    migrated.componentInstance.watch(after);
    migrated.detectChanges();
    await migrated.whenStable();

    after.next(3);
    await migrated.whenStable();
    expect(migrated.nativeElement.querySelector('.open').textContent).toBe('3');
  });

  it('Section 6: code waiting on NgZone.onStable never continues', async () => {
    const fixture = TestBed.createComponent(ZoneEraBoard);
    fixture.componentInstance.watch(new Subject<number>());
    fixture.detectChanges();
    await fixture.whenStable();
    await settleTimers();

    expect(fixture.componentInstance.status).toBe('loading');
    expect(fixture.nativeElement.querySelector('.status').textContent).toBe('loading');
  });

  it('Section 6: afterNextRender runs after the render where onStable never fires', async () => {
    const stable: string[] = [];
    TestBed.inject(NgZone).onStable.subscribe(() => stable.push('onStable'));
    const fixture = TestBed.createComponent(SignalBoard);
    fixture.detectChanges();
    await fixture.whenStable();
    await settleTimers();

    expect(fixture.nativeElement.querySelector('.status').textContent).toBe('ready');
    expect(stable).toEqual([]);
  });
});
