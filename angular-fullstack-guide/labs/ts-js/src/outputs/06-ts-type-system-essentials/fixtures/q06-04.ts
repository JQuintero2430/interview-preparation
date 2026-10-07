interface Point {
  x: number;
  y: number;
}
interface Options {
  verbose?: boolean;
  color?: string;
}

const a: Point = { x: 1, y: 2, z: 3 };
const raw = { x: 1, y: 2, z: 3 };
const b: Point = raw;
const c: Options = { colour: 'red' };
const typo = { colour: 'red' };
const d: Options = typo;
const loose = { colour: 'red', verbose: true };
const e: Options = loose;
