import { ComponentFixture, TestBed } from '@angular/core/testing';
import { inputBinding, outputBinding, signal } from '@angular/core';
import { LabM29Rating } from './rating';

interface Mounted {
  fixture: ComponentFixture<LabM29Rating>;
  setValue(next: number): Promise<void>;
  rated: number[];
}

type Mount = (value: number, max: number, readonly: boolean) => Promise<Mounted>;

const mountWithSetInput: Mount = async (value, max, readonly) => {
  const fixture = TestBed.createComponent(LabM29Rating);
  const rated: number[] = [];
  fixture.componentInstance.rated.subscribe((point) => rated.push(point));
  fixture.componentRef.setInput('value', value);
  fixture.componentRef.setInput('max', max);
  fixture.componentRef.setInput('readonly', readonly);
  await fixture.whenStable();
  return {
    fixture,
    rated,
    setValue: async (next) => {
      fixture.componentRef.setInput('value', next);
      await fixture.whenStable();
    },
  };
};

const mountWithBindings: Mount = async (initial, max, readonly) => {
  const value = signal(initial);
  const rated: number[] = [];
  const fixture = TestBed.createComponent(LabM29Rating, {
    bindings: [
      inputBinding('value', value),
      inputBinding('max', () => max),
      inputBinding('readonly', () => readonly),
      outputBinding<number>('rated', (point) => rated.push(point)),
    ],
  });
  await fixture.whenStable();
  return {
    fixture,
    rated,
    setValue: async (next) => {
      value.set(next);
      TestBed.tick();
      await fixture.whenStable();
    },
  };
};

const mounts: [string, Mount][] = [
  ['setInput', mountWithSetInput],
  ['bindings', mountWithBindings],
];

// Queries use the button role; the accessible name is the aria-label, as the template sets no text name.
function buttons(fixture: ComponentFixture<LabM29Rating>): HTMLButtonElement[] {
  const root: HTMLElement = fixture.nativeElement;
  return Array.from(root.querySelectorAll('button'));
}

function nameOf(button: HTMLButtonElement): string | null {
  return button.getAttribute('aria-label');
}

describe.each(mounts)('E29.1 rating component (%s)', (_name, mount) => {
  it('renders one button per point of max', async () => {
    const { fixture } = await mount(2, 4, false);
    expect(buttons(fixture)).toHaveLength(4);
  });

  it('marks the buttons up to the value as pressed', async () => {
    const { fixture } = await mount(3, 5, false);
    expect(buttons(fixture).map((button) => button.getAttribute('aria-pressed'))).toEqual([
      'true',
      'true',
      'true',
      'false',
      'false',
    ]);
  });

  it('updates the pressed buttons after the value changes', async () => {
    const { fixture, setValue } = await mount(1, 5, false);
    await setValue(4);
    expect(buttons(fixture).map((button) => button.getAttribute('aria-pressed'))).toEqual([
      'true',
      'true',
      'true',
      'true',
      'false',
    ]);
  });

  it('emits rated with the clicked point', async () => {
    const { fixture, rated } = await mount(1, 5, false);
    buttons(fixture)
      .find((button) => nameOf(button) === 'Rate 4 of 5')
      ?.click();
    expect(rated).toEqual([4]);
  });

  it('emits nothing when readonly', async () => {
    const { fixture, rated } = await mount(2, 5, true);
    buttons(fixture).forEach((button) => button.click());
    expect(buttons(fixture).every((button) => button.disabled)).toBe(true);
    expect(rated).toEqual([]);
  });

  it('names each button with its point and the maximum', async () => {
    const { fixture } = await mount(1, 3, false);
    expect(buttons(fixture).map(nameOf)).toEqual(['Rate 1 of 3', 'Rate 2 of 3', 'Rate 3 of 3']);
  });
});
