import { NgZone } from '@angular/core';
import { TestBed, getTestBed } from '@angular/core/testing';

const RELATIVE_MOCK_MESSAGE =
  'The "vi.mock" and related methods are not supported for relative imports with the Angular unit-test system. ' +
  'Please use Angular TestBed for mocking dependencies.';

describe('Section 2: the runner', () => {
  it('Section 2: tests run in jsdom without zone.js', () => {
    expect(navigator.userAgent).toContain('jsdom');
    expect('Zone' in globalThis).toBe(false);
    expect(TestBed.inject(NgZone).constructor.name).toBe('NoopNgZone');
  });

  it('Section 2: TestBed is initialized before the spec runs', () => {
    expect(getTestBed().platform).not.toBeNull();
  });

  it('Section 2: vi.mock of a relative path is rejected', () => {
    expect(() => vi.doMock('./x', () => ({}))).toThrow(RELATIVE_MOCK_MESSAGE);
    expect(() => vi.doUnmock('../x')).toThrow(RELATIVE_MOCK_MESSAGE);
  });

  it('Section 2: vi.fn works without any module mocking', () => {
    const double = vi.fn((n: number) => n * 2);

    expect(double(21)).toBe(42);
    expect(double).toHaveBeenCalledTimes(1);
    expect(double).toHaveBeenCalledWith(21);
  });
});
