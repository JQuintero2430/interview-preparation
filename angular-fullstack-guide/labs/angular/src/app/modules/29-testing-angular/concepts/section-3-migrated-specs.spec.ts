import { Component, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

abstract class LabM29Greeter {
  abstract greet(name: string): string;
  abstract reset(): void;
}

class LabM29Welcome {
  private readonly greeter = inject(LabM29Greeter);

  welcome(name: string): string {
    return `${this.greeter.greet(name)}!`;
  }
}

@Component({
  selector: 'lab-m29-late-message',
  template: '{{ message() }}',
})
class LabM29LateMessage {
  protected readonly message = signal('wait');

  constructor() {
    setTimeout(() => this.message.set('done'), 1000);
  }
}

describe('Section 3: migrated specs', () => {
  afterEach(() => vi.useRealTimers());

  it('Section 3: an object of vi.fn replaces jasmine.createSpyObj', () => {
    // The schematic turns jasmine.createSpyObj('LabM29Greeter', ['greet', 'reset']) into this shape.
    const greeter = {
      greet: vi.fn<LabM29Greeter['greet']>().mockName('LabM29Greeter.greet'),
      reset: vi.fn<LabM29Greeter['reset']>().mockName('LabM29Greeter.reset'),
    };
    greeter.greet.mockReturnValue('Hello');
    TestBed.configureTestingModule({
      providers: [LabM29Welcome, { provide: LabM29Greeter, useValue: greeter }],
    });

    expect(TestBed.inject(LabM29Welcome).welcome('Ada')).toBe('Hello!');
    expect(greeter.greet).toHaveBeenCalledWith('Ada');
    expect(greeter.reset).not.toHaveBeenCalled();
    expect(greeter.greet.getMockName()).toBe('LabM29Greeter.greet');
  });

  it('Section 3: mockReturnValue replaces and.returnValue', () => {
    const double = vi.fn<(n: number) => number>();
    expect(double(1)).toBeUndefined();

    double.mockReturnValue(7);

    expect(double(2)).toBe(7);
    expect(double).toHaveBeenCalledTimes(2);
    expect(double).toHaveBeenLastCalledWith(2);
  });

  it("Section 3: the schematic's fake-timer setup lets whenStable resolve", async () => {
    vi.useFakeTimers({ advanceTimeDelta: 1, shouldAdvanceTime: true });
    const fixture = TestBed.createComponent(LabM29LateMessage);

    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('wait');

    await vi.advanceTimersByTimeAsync(1000);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('done');
  });
});
