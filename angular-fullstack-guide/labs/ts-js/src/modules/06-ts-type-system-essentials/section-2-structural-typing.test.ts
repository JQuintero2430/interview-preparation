// Section 2 claims: assignability by shape, excess property checks on fresh literals, weak types, private members, readonly.
import ts from 'typescript';
import { diagnosticCodes } from './typecheck';

const POINT = 'interface Point { x: number; y: number }\n';

describe('Module 06 · section 2', () => {
  it('Section 2: any value with the right members is assignable, whatever its declared name', () => {
    expect(diagnosticCodes(`${POINT}class Pixel { constructor(public x: number, public y: number, public color: string) {} }
export const p: Point = new Pixel(1, 2, 'red');`)).toEqual([]);
  });

  it('Section 2: two string aliases are interchangeable, so swapped IDs compile', () => {
    expect(diagnosticCodes(`type UserId = string; type OrderId = string;
function cancel(user: UserId, order: OrderId) { return [user, order]; }
const order: OrderId = 'o-1'; const user: UserId = 'u-1';
export const result = cancel(order, user);`)).toEqual([]);
  });

  it('Section 2: an excess property is an error only in a fresh object literal (TS2353)', () => {
    expect(diagnosticCodes(`${POINT}export const p: Point = { x: 1, y: 2, z: 3 };`)).toEqual([2353]);
    expect(diagnosticCodes(`${POINT}const raw = { x: 1, y: 2, z: 3 };\nexport const p: Point = raw;`)).toEqual([]);
  });

  it('Section 2: a weak type (all optional) rejects a value with no property in common (TS2559)', () => {
    const OPTIONS = 'interface Options { verbose?: boolean; color?: string }\n';
    expect(diagnosticCodes(`${OPTIONS}const typo = { colour: 'red' };\nexport const options: Options = typo;`)).toEqual([2559]);
  });

  it('Section 2: classes compare structurally, unless they declare private members (TS2322)', () => {
    expect(diagnosticCodes('class A { x = 1 }\nclass B { x = 1 }\nexport const a: A = new B();')).toEqual([]);
    expect(diagnosticCodes('class A { private x = 1 }\nclass B { private x = 1 }\nexport const a: A = new B();')).toEqual([2322]);
  });

  it('Section 2: TypeScript private is erased from the emit, while #private stays', () => {
    const { outputText } = ts.transpileModule('export class Account { private pin = 1234; #token = "t"; }', {
      compilerOptions: { target: ts.ScriptTarget.ES2024, module: ts.ModuleKind.Preserve },
    });
    expect(outputText).toBe('export class Account {\n    pin = 1234;\n    #token = "t";\n}\n');
  });

  it('Section 2: readonly blocks assignment (TS2540) and push (TS2339), but a mutable alias still writes', () => {
    expect(diagnosticCodes('const p: { readonly x: number } = { x: 1 };\np.x = 2;')).toEqual([2540]);
    expect(diagnosticCodes('const list: readonly number[] = [1];\nlist.push(2);')).toEqual([2339]);
    expect(diagnosticCodes('const p: { readonly x: number } = { x: 1 };\nconst alias: { x: number } = p;\nalias.x = 2;')).toEqual([]);
  });
});
