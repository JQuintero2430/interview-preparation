import { describe, expect, it } from 'vitest';
import { contrastRatio, parseHex, passesAA, relativeLuminance } from './contrast';

describe('Section 1: WCAG contrast ratio (pure TypeScript model of the WCAG 2.2 formula)', () => {
  it('Section 1: black on white is 21:1', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 10);
    expect(relativeLuminance('#fff')).toBeCloseTo(1, 10);
    expect(relativeLuminance('#000')).toBe(0);
  });

  it('Section 1: #767676 on white is about 4.54 and passes AA for normal text, #777777 is about 4.48 and fails', () => {
    const grey76 = contrastRatio('#767676', '#ffffff');
    const grey77 = contrastRatio('#777777', '#ffffff');
    expect(grey76).toBeCloseTo(4.54, 2);
    expect(grey77).toBeCloseTo(4.48, 2);
    expect(passesAA(grey76)).toBe(true);
    expect(passesAA(grey77)).toBe(false);
  });

  it('Section 1: the ratio is symmetric in the two colours', () => {
    expect(contrastRatio('#1a73e8', '#fffbe6')).toBe(contrastRatio('#fffbe6', '#1a73e8'));
  });

  it('Section 1: large text uses the 3:1 threshold', () => {
    const ratio = contrastRatio('#949494', '#ffffff');
    expect(ratio).toBeGreaterThanOrEqual(3);
    expect(ratio).toBeLessThan(4.5);
    expect(passesAA(ratio, { largeText: true })).toBe(true);
    expect(passesAA(ratio)).toBe(false);
  });

  it('Section 1: three-digit hex expands and malformed colours are rejected', () => {
    expect(parseHex('#abc')).toEqual([170, 187, 204]);
    expect(() => parseHex('red')).toThrow();
  });
});
