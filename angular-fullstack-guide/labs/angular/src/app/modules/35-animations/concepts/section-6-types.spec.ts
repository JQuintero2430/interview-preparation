import { type AnimationCallbackEvent, MAX_ANIMATION_TIMEOUT } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('Section 6: types', () => {
  it('Section 6: MAX_ANIMATION_TIMEOUT defaults to 4000', () => {
    expect(TestBed.inject(MAX_ANIMATION_TIMEOUT)).toBe(4000);
  });

  it('Section 6: animationComplete is typed as VoidFunction', () => {
    const calls: string[] = [];
    const event: AnimationCallbackEvent = {
      target: document.createElement('div'),
      animationComplete: () => calls.push('complete'),
    };
    event.animationComplete();
    // @ts-expect-error VoidFunction takes no arguments (it was `Function` before v22.0).
    event.animationComplete('done');
    expect(calls).toEqual(['complete', 'complete']);
  });
});
