import { AsyncPipe } from '@angular/common';
import { Component, ErrorHandler, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { Observer } from 'rxjs';

// A hand-written source with the one method the pipe needs. It counts subscriptions and
// unsubscriptions, and keeps every observer ever given so a test can push a "late" value
// through an observer that was already unsubscribed.
class CountingSource<T> {
  subs = 0;
  unsubs = 0;
  private readonly everSubscribed: Partial<Observer<T>>[] = [];
  private live: Partial<Observer<T>>[] = [];

  subscribe(observer: Partial<Observer<T>>): { unsubscribe(): void } {
    this.subs++;
    this.everSubscribed.push(observer);
    this.live.push(observer);
    return {
      unsubscribe: () => {
        this.unsubs++;
        this.live = this.live.filter((o) => o !== observer);
      },
    };
  }

  emit(value: T): void {
    this.live.forEach((o) => o.next?.(value));
  }

  emitLate(value: T): void {
    this.everSubscribed.forEach((o) => o.next?.(value));
  }

  fail(error: unknown): void {
    this.live.forEach((o) => o.error?.(error));
  }
}

@Component({
  selector: 'lab-s8-value-host',
  imports: [AsyncPipe],
  template: `<p id="v">[{{ src() | async }}]</p>`,
})
class ValueHost {
  readonly src = signal<CountingSource<number> | null>(null);
}

@Component({
  selector: 'lab-s8-three-host',
  imports: [AsyncPipe],
  template: `
    <p id="a">{{ src | async }}</p>
    <p id="b">{{ src | async }}</p>
    <p id="c">{{ src | async }}</p>
  `,
})
class ThreeHost {
  readonly src = new CountingSource<number>();
}

@Component({
  selector: 'lab-s8-let-host',
  imports: [AsyncPipe],
  template: `
    @let v = src | async;
    <p id="a">{{ v }}</p>
    <p id="b">{{ v }}</p>
  `,
})
class LetHost {
  readonly src = new CountingSource<number>();
}

@Component({
  selector: 'lab-s8-promise-host',
  imports: [AsyncPipe],
  template: `<p id="p">[{{ promise | async }}]</p>`,
})
class PromiseHost {
  readonly promise = Promise.resolve(7);
}

@Component({
  selector: 'lab-s8-signal-host',
  imports: [AsyncPipe],
  template: `<p>{{ $any(sig) | async }}</p>`,
})
class SignalHost {
  readonly sig = signal(1);
}

function text(root: HTMLElement, selector: string): string {
  return root.querySelector(selector)?.textContent ?? '';
}

describe('Section 8: the async pipe', () => {
  it('Section 8: the async pipe shows null before the first value and updates after each emission', async () => {
    const fixture = TestBed.createComponent(ValueHost);
    const source = new CountingSource<number>();
    fixture.componentInstance.src.set(source);
    fixture.detectChanges();
    expect(text(fixture.nativeElement, '#v')).toBe('[]');

    source.emit(1);
    await fixture.whenStable();
    expect(text(fixture.nativeElement, '#v')).toBe('[1]');

    source.emit(2);
    await fixture.whenStable();
    expect(text(fixture.nativeElement, '#v')).toBe('[2]');
  });

  it('Section 8: each async pipe subscribes separately and an @let binding shares one', () => {
    const three = TestBed.createComponent(ThreeHost);
    three.detectChanges();
    expect(three.componentInstance.src.subs).toBe(3);

    const shared = TestBed.createComponent(LetHost);
    shared.detectChanges();
    expect(shared.componentInstance.src.subs).toBe(1);
  });

  it('Section 8: swapping the source unsubscribes the old one and ignores its late values', async () => {
    const fixture = TestBed.createComponent(ValueHost);
    const first = new CountingSource<number>();
    const second = new CountingSource<number>();
    fixture.componentInstance.src.set(first);
    fixture.detectChanges();
    first.emit(1);
    await fixture.whenStable();
    expect(text(fixture.nativeElement, '#v')).toBe('[1]');

    fixture.componentInstance.src.set(second);
    await fixture.whenStable();
    expect([first.subs, first.unsubs, second.subs, second.unsubs]).toEqual([1, 1, 1, 0]);
    expect(text(fixture.nativeElement, '#v')).toBe('[]');

    first.emitLate(99);
    second.emit(100);
    await fixture.whenStable();
    expect(text(fixture.nativeElement, '#v')).toBe('[100]');
  });

  it('Section 8: destroying the view unsubscribes', () => {
    const fixture = TestBed.createComponent(ThreeHost);
    fixture.detectChanges();
    expect(fixture.componentInstance.src.unsubs).toBe(0);

    fixture.destroy();
    expect(fixture.componentInstance.src.unsubs).toBe(3);
  });

  it('Section 8: a stream error reaches the ErrorHandler and the last value stays', async () => {
    const errors: unknown[] = [];
    TestBed.configureTestingModule({
      rethrowApplicationErrors: false,
      providers: [{ provide: ErrorHandler, useValue: { handleError: (e: unknown) => errors.push(e) } }],
    });
    const fixture = TestBed.createComponent(ValueHost);
    const source = new CountingSource<number>();
    fixture.componentInstance.src.set(source);
    fixture.detectChanges();
    source.emit(5);
    await fixture.whenStable();

    source.fail('boom');
    await fixture.whenStable();
    expect(errors).toEqual(['boom']);
    expect(text(fixture.nativeElement, '#v')).toBe('[5]');
  });

  it('Section 8: with the TestBed default a stream error is rethrown to the test', () => {
    const fixture = TestBed.createComponent(ValueHost);
    const source = new CountingSource<number>();
    fixture.componentInstance.src.set(source);
    fixture.detectChanges();

    expect(() => source.fail('boom')).toThrow('boom');
  });

  it('Section 8: a signal passed to async throws NG02100', () => {
    const fixture = TestBed.createComponent(SignalHost);
    expect(() => fixture.detectChanges()).toThrowError(
      /NG02100: InvalidPipeArgument: '\[Signal \(sig\): 1\]' for pipe 'AsyncPipe'/,
    );
  });

  it('Section 8: a promise renders its value', async () => {
    const fixture = TestBed.createComponent(PromiseHost);
    fixture.detectChanges();
    expect(text(fixture.nativeElement, '#p')).toBe('[]');

    // The first wait lets the promise callback run; it marks the view, and the second wait covers the check.
    await fixture.whenStable();
    await fixture.whenStable();
    expect(text(fixture.nativeElement, '#p')).toBe('[7]');
  });
});
