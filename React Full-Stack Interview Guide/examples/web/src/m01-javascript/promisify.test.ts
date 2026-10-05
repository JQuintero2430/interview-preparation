import { promisify, type NodeCallback } from './promisify';

function legacyDouble(n: number, cb: NodeCallback<number>): void {
  if (n < 0) cb(new Error('negative'));
  else cb(null, n * 2);
}

test('resolves with the callback value', async () => {
  const double = promisify(legacyDouble);
  expect(await double(21)).toBe(42);
});

test('rejects with the callback error', async () => {
  const double = promisify(legacyDouble);
  await expect(double(-1)).rejects.toThrow('negative');
});

test('even a synchronous callback is observed asynchronously by then()', async () => {
  const order: string[] = [];
  const double = promisify(legacyDouble);
  const p = double(1).then(() => order.push('then'));
  order.push('after call');
  await p;
  expect(order).toEqual(['after call', 'then']);
});
