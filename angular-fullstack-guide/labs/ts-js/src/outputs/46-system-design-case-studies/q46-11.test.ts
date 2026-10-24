// Output question Q46.11: our grid query (concepts/grid-query.ts, our model, not Spring Data's code). Two URLs list the
// same filters in different orders; then a query on a page-three cursor changes its sort. Plain values only: no
// network, clock, router or storage.
import { cacheKey, fromParams, toParams, withSort, type GridQuery } from '../../modules/46-system-design-case-studies/concepts/grid-query';
import { captureLogs } from '../capture';

describe('46 · Q46.11', () => {
  it('Q46.11 our grid query', async () => {
    const lines = await captureLogs((log) => {
      const one = fromParams('status=open&customer=7');
      const other = fromParams('customer=7&status=open');
      log(`same key: ${cacheKey(one) === cacheKey(other)}`);
      log(cacheKey(one));

      const pageThree: GridQuery = { ...withSort(one, [{ field: 'createdAt', direction: 'desc' }]), after: '[80,"o8"]' };
      log(`page three: ${toParams(pageThree)}`);

      const resorted = withSort(pageThree, [{ field: 'total', direction: 'desc' }]);
      log(`after sort change: ${toParams(resorted)}`);
      log(`cursor: ${resorted.after}`);
    });

    expect(lines).toEqual([
      'same key: true',
      'GET /api/orders?customer=7&status=open&sort=id,asc&limit=50',
      'page three: customer=7&status=open&sort=createdAt,desc&sort=id,desc&limit=50&after=%5B80,%22o8%22%5D',
      'after sort change: customer=7&status=open&sort=total,desc&sort=id,desc&limit=50',
      'cursor: null',
    ]);
  });
});
