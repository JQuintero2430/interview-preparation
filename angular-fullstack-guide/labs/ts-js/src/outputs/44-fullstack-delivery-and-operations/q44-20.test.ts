// Output question Q44.20: five headers through our parseTraceparent in concepts/trace-context.ts (our codec of W3C
// Trace Context Level 1 §3.2.2 and §3.2.4, read 2026-10-22; OpenTelemetry's parser is not run).
import { parseTraceparent } from '../../modules/44-fullstack-delivery-and-operations/concepts/trace-context';
import { captureLogs } from '../capture';

describe('44 · Q44.20', () => {
  it('Q44.20 five traceparent headers: which are accepted and with which flags', async () => {
    const trace = '0af7651916cd43dd8448eb211c80319c';
    const span = 'b7ad6b7169203331';
    const headers = [
      ['valid', `00-${trace}-${span}-01`],
      ['all-zero trace ID', `00-${'0'.repeat(32)}-${span}-01`],
      ['uppercase', `00-${trace.toUpperCase()}-${span}-01`],
      ['version ff', `ff-${trace}-${span}-01`],
      ['version 01 plus field', `01-${trace}-${span}-01-extra`],
    ];
    const lines = await captureLogs((log) => {
      for (const [name, header] of headers) {
        const parsed = parseTraceparent(header ?? '');
        const outcome =
          parsed === null ? 'ignored' : `accepted, version ${parsed.version}, flags ${parsed.flags}, sampled ${parsed.sampled}`;
        log(name, '→', outcome);
      }
    });
    expect(lines).toEqual([
      'valid → accepted, version 00, flags 1, sampled true',
      'all-zero trace ID → ignored',
      'uppercase → ignored',
      'version ff → ignored',
      'version 01 plus field → accepted, version 01, flags 1, sampled true',
    ]);
  });
});
