import {
  afterEveryRender,
  ApplicationRef,
  Component,
  input,
  NgZone,
  PendingTasks,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';

// --- Fixtures (OnPush, the v22 default). Plain fields and signals sit side by side; `renders` counts render hooks. ---

@Component({ selector: 'lab-m21-s5-counter', template: `{{ count() }}|{{ plain }}` })
class Counter {
  readonly count = signal(0);
  plain = 'a';
  renders = 0;

  constructor() {
    afterEveryRender(() => {
      this.renders += 1;
    });
  }
}

@Component({
  selector: 'lab-m21-s5-notified',
  template: `{{ v() }}|{{ clicked }}<button type="button" (click)="clicked = 'yes'">go</button>`,
})
class Notified {
  readonly v = input('init');
  clicked = 'no';
}

const settleTimers = () => new Promise<void>((resolve) => setTimeout(resolve, 20));

const isStable = () => firstValueFrom(TestBed.inject(ApplicationRef).isStable);

describe('Section 5: zoneless change detection', () => {
  it('Section 5: three signal writes in one turn render once after the stable point', async () => {
    const fixture = TestBed.createComponent(Counter);
    fixture.detectChanges();
    await fixture.whenStable();
    const counter = fixture.componentInstance;
    counter.renders = 0;

    counter.count.set(1);
    counter.count.set(2);
    counter.count.set(3);
    expect(fixture.nativeElement.textContent).toBe('0|a');
    expect(counter.renders).toBe(0);

    await Promise.resolve();
    expect(fixture.nativeElement.textContent).toBe('0|a');

    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('3|a');
    expect(counter.renders).toBe(1);
  });

  it('Section 5: a tick with nothing dirty renders nothing', async () => {
    const fixture = TestBed.createComponent(Counter);
    fixture.detectChanges();
    await fixture.whenStable();
    const counter = fixture.componentInstance;
    counter.renders = 0;

    TestBed.inject(ApplicationRef).tick();
    await fixture.whenStable();

    expect(counter.renders).toBe(0);
    expect(fixture.nativeElement.textContent).toBe('0|a');
  });

  it('Section 5: a plain-field write is not rendered until a notification', async () => {
    const fixture = TestBed.createComponent(Counter);
    fixture.detectChanges();
    await fixture.whenStable();
    const counter = fixture.componentInstance;

    counter.plain = 'b';
    await fixture.whenStable();
    await settleTimers();
    expect(fixture.nativeElement.textContent).toBe('0|a');

    counter.count.set(1);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('1|b');
  });

  it('Section 5: setInput and an event notify the scheduler', async () => {
    const fixture = TestBed.createComponent(Notified);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('init|no');

    fixture.componentRef.setInput('v', 'new');
    expect(fixture.nativeElement.textContent).toContain('init|no');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('new|no');

    fixture.debugElement.query(By.css('button')).nativeElement.click();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('new|yes');
  });

  it('Section 5: an open pending task keeps isStable false and whenStable pending', async () => {
    const app = TestBed.inject(ApplicationRef);
    expect(await isStable()).toBe(true);

    const done = TestBed.inject(PendingTasks).add();
    expect(await isStable()).toBe(false);

    let resolved = false;
    void app.whenStable().then(() => {
      resolved = true;
    });
    await settleTimers();
    expect(resolved).toBe(false);

    done();
    await app.whenStable();
    expect(resolved).toBe(true);
    expect(await isStable()).toBe(true);
  });

  it('Section 5: PendingTasks.run keeps the app unstable until the promise settles', async () => {
    const app = TestBed.inject(ApplicationRef);
    let release: () => void = () => undefined;
    const work = new Promise<void>((resolve) => {
      release = resolve;
    });

    TestBed.inject(PendingTasks).run(() => work);
    expect(await isStable()).toBe(false);

    release();
    await app.whenStable();
    expect(await isStable()).toBe(true);
  });

  it('Section 5: NgZone is a no-op in a zoneless app', async () => {
    const zone = TestBed.inject(NgZone);
    const emitted: string[] = [];
    zone.onMicrotaskEmpty.subscribe(() => emitted.push('onMicrotaskEmpty'));
    zone.onStable.subscribe(() => emitted.push('onStable'));
    zone.onUnstable.subscribe(() => emitted.push('onUnstable'));

    const fixture = TestBed.createComponent(Counter);
    fixture.detectChanges();
    fixture.componentInstance.count.set(1);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('1|a');
    expect(zone.constructor.name).toBe('NoopNgZone');
    expect(zone.isStable).toBe(true);
    expect(zone.hasPendingMacrotasks).toBe(false);
    expect(emitted).toEqual([]);
    expect(zone.run(() => 42)).toBe(42);
    expect(zone.runOutsideAngular(() => 43)).toBe(43);
    expect(NgZone.isInAngularZone()).toBe(false);
    expect((globalThis as { Zone?: unknown }).Zone).toBeUndefined();
  });
});
