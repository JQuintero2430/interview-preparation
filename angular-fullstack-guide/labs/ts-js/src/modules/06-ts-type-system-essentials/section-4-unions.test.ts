// Section 4 claims: union member access, intersections that reduce to never, discriminants and exhaustiveness.
import { diagnosticCodes } from './typecheck';

const SHAPE = `type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }
  | { kind: 'triangle'; base: number; height: number };
function assertNever(value: never): never { throw new Error('unexpected ' + JSON.stringify(value)); }
`;
const CIRCLE_AND_SQUARE = "case 'circle': return Math.PI * shape.radius ** 2; case 'square': return shape.side ** 2;";
const TRIANGLE = "case 'triangle': return (shape.base * shape.height) / 2;";

describe('Module 06 · section 4', () => {
  it('Section 4: only members common to every union member can be read before narrowing (TS2339)', () => {
    expect(diagnosticCodes('export function f(x: { a: string; b: number } | { a: string; c: boolean }) { return [x.a, x.b]; }')).toEqual([2339]);
  });

  it('Section 4: a discriminant narrows to one member, so another member\'s property is an error (TS2339)', () => {
    expect(diagnosticCodes(`${SHAPE}export function f(shape: Shape) { if (shape.kind === 'circle') { return shape.side; } return 0; }`)).toEqual([2339]);
  });

  it('Section 4: conflicting properties make the property never; conflicting discriminants make the whole intersection never', () => {
    const isNever = (type: string) => `export const isNever: [${type}] extends [never] ? true : false = true;`;
    expect(diagnosticCodes(`type T = { a: string } & { a: number };\n${isNever("T['a']")}`)).toEqual([]);
    expect(diagnosticCodes(`type T = { a: string } & { a: number };\n${isNever('T')}`)).toEqual([2322]);
    expect(diagnosticCodes(`type T = { kind: 'a' } & { kind: 'b' };\n${isNever('T')}`)).toEqual([]);
    expect(diagnosticCodes("export const v: string & number = 'x';")).toEqual([2322]);
  });

  it('Section 4: a switch that handles every member compiles with an assertNever default', () => {
    expect(
      diagnosticCodes(`${SHAPE}export function area(shape: Shape): number { switch (shape.kind) { ${CIRCLE_AND_SQUARE} ${TRIANGLE} default: return assertNever(shape); } }`),
    ).toEqual([]);
  });

  it('Section 4: a missing case is reported by assertNever (TS2345), by satisfies never (TS1360) or by the return type (TS2366)', () => {
    const area = (rest: string) => `${SHAPE}export function area(shape: Shape): number { switch (shape.kind) { ${CIRCLE_AND_SQUARE} ${rest} } }`;
    expect(diagnosticCodes(area('default: return assertNever(shape);'))).toEqual([2345]);
    expect(diagnosticCodes(area('default: shape satisfies never; throw new Error("unreachable");'))).toEqual([1360]);
    expect(diagnosticCodes(area(''))).toEqual([2366]);
  });

  it('Section 4: noFallthroughCasesInSwitch reports a case that falls into the next one (TS7029)', () => {
    expect(diagnosticCodes('export function f(x: number) { let r = 0; switch (x) { case 1: r = 1; case 2: r = 2; break; } return r; }')).toEqual([7029]);
  });
});
