import type { NextRequest } from 'next/server';

// A Route Handler: a Web Request in, a Web Response out. Reading the request makes it dynamic.
// `next build` 16.3.8 output (predicted, then confirmed by running it): "ƒ /api/echo" (Dynamic).
export function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('n');
  const n = raw === null ? Number.NaN : Number(raw);
  if (!Number.isInteger(n) || n < 0 || n > 1000) {
    return Response.json({ error: 'n must be an integer from 0 to 1000' }, { status: 400 });
  }
  return Response.json({ n, doubled: n * 2 });
}
