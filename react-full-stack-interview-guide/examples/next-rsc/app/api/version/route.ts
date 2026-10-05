// Opting a GET handler into static generation (Next 15+ does not cache GET handlers by default).
// `next build` 16.3.8 output (predicted, then confirmed by running it): "○ /api/version" (Static).
export const dynamic = 'force-static';

export function GET() {
  return Response.json({ guide: 'react-full-stack', module: 21 });
}
