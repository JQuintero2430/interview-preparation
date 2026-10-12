// WCAG 2.2 "relative luminance" and "contrast ratio" for sRGB colours written as #rgb or #rrggbb.
// Constants follow the WCAG 2.2 definition of relative luminance (threshold 0.04045, read 2026-10-07).

export type Rgb = readonly [red: number, green: number, blue: number];

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function parseHex(colour: string): Rgb {
  const digits = HEX.exec(colour.trim())?.[1];
  if (digits === undefined) throw new Error(`Not a #rgb or #rrggbb colour: ${colour}`);
  const full = digits.length === 3 ? digits.replace(/./g, (d) => d + d) : digits;
  const channel = (start: number): number => parseInt(full.slice(start, start + 2), 16);
  return [channel(0), channel(2), channel(4)];
}

function linearise(channel8Bit: number): number {
  const srgb = channel8Bit / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(colour: string): number {
  const [r, g, b] = parseHex(colour);
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b);
}

export function contrastRatio(first: string, second: string): number {
  const [a, b] = [relativeLuminance(first), relativeLuminance(second)];
  const [lighter, darker] = a >= b ? [a, b] : [b, a];
  return (lighter + 0.05) / (darker + 0.05);
}

/** SC 1.4.3 (AA): at least 4.5:1, or 3:1 for large-scale text. SC 1.4.11 asks 3:1 for UI components and graphics. */
export function passesAA(ratio: number, options: { largeText?: boolean } = {}): boolean {
  return ratio >= (options.largeText ? 3 : 4.5);
}
