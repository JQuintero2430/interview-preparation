import { connection } from 'next/server';
import { Suspense } from 'react';
import { Slow } from './Slow';

// `await connection()` says "this needs a real request": the route is rendered per request.
// `next build` 16.3.8 output (predicted, then confirmed by running it): "ƒ /streaming" (Dynamic). Each Suspense boundary streams independently.
export default async function StreamingPage() {
  await connection();
  return (
    <main>
      <h1>Streaming</h1>
      <p>This heading is in the shell and arrives first.</p>
      <Suspense fallback={<p>Loading fast widget…</p>}>
        <Slow label="Fast widget" ms={300} />
      </Suspense>
      <Suspense fallback={<p>Loading slow widget…</p>}>
        <Slow label="Slow widget" ms={1500} />
      </Suspense>
    </main>
  );
}
