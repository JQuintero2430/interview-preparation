// Output question Q41.19: JSON.parse on a payload shaped like Jackson 3's defaults (ours; Jackson is not run).
import { captureLogs } from '../capture';

describe('41 · Q41.19', () => {
  it('Q41.19 JSON.parse keeps both dates as strings and rounds the Long and the BigDecimal to doubles', async () => {
    const lines = await captureLogs((log) => {
      const payload =
        '{"placedAt":"2026-10-20T21:30:00Z","deliveryDate":"2026-10-21","id":9007199254740993,"total":12345678901234567.89,"price":19.90}';
      const order: { placedAt: string; deliveryDate: string; id: number; total: number; price: number } = JSON.parse(payload);
      log(typeof order.placedAt);
      log(order.deliveryDate);
      log(order.id);
      log(order.total);
      log(order.price);
    });
    expect(lines).toEqual(['string', '2026-10-21', '9007199254740992', '12345678901234568', '19.9']);
  });
});
