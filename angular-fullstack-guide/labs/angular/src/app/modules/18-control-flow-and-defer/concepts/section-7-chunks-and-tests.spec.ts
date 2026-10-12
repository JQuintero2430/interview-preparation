import { Component } from '@angular/core';
import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { LabM18Quick } from './fixtures/lab-m18-quick';

// --- Hosts: one @defer each, with a sub-block per state and an id per sub-block ---

@Component({
  selector: 'lab-m18-s7-single',
  imports: [LabM18Quick],
  template: `
    @defer (on idle) {
      <lab-m18-quick />
    } @placeholder {
      <p id="placeholder">placeholder</p>
    } @loading {
      <p id="loading">loading</p>
    }
  `,
})
class SingleHost {}

@Component({
  selector: 'lab-m18-s7-pair',
  imports: [LabM18Quick],
  template: `
    @defer (on immediate) {
      <lab-m18-quick />
    } @placeholder {
      <p id="first">first placeholder</p>
    }
    @defer (on idle) {
      <lab-m18-quick />
    } @placeholder {
      <p id="second">second placeholder</p>
    }
  `,
})
class PairHost {}

const pause = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

describe('Section 7: testing deferred blocks', () => {
  it('Section 7: manual mode keeps every block in its first state', async () => {
    TestBed.configureTestingModule({ deferBlockBehavior: DeferBlockBehavior.Manual });
    const fixture = TestBed.createComponent(PairHost);
    fixture.detectChanges();
    await pause(100);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect((await fixture.getDeferBlocks()).length).toBe(2);
    expect(root.querySelector('#first')).not.toBeNull();
    expect(root.querySelector('#second')).not.toBeNull();
    expect(root.querySelector('#content')).toBeNull();
  });

  it('Section 7: render moves a block to a chosen state', async () => {
    TestBed.configureTestingModule({ deferBlockBehavior: DeferBlockBehavior.Manual });
    const fixture = TestBed.createComponent(SingleHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const [block] = await fixture.getDeferBlocks();
    expect(root.querySelector('#placeholder')).not.toBeNull();

    await block.render(DeferBlockState.Loading);
    expect(root.querySelector('#loading')).not.toBeNull();
    expect(root.querySelector('#placeholder')).toBeNull();

    await block.render(DeferBlockState.Complete);
    expect(root.querySelector('#content')).not.toBeNull();
    expect(root.querySelector('#loading')).toBeNull();
  });

  it('Section 7: playthrough is the default', async () => {
    const fixture = TestBed.createComponent(SingleHost);
    fixture.detectChanges();
    await pause(100);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('#content')).not.toBeNull();
    expect(DeferBlockBehavior.Playthrough).toBe(1);
  });
});
