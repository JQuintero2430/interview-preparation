import Link from 'next/link';

// The index page. Each example below is one route folder.
export default function Home() {
  return (
    <main>
      <h1>Module 21 examples</h1>
      <ul>
        <li>
          <Link href="/rsc-island">Server Component with a Client island</Link>
        </li>
        <li>
          <Link href="/server-action">Server Function form with useActionState</Link>
        </li>
        <li>
          <Link href="/streaming">Streaming with Suspense</Link>
        </li>
        <li>
          <Link href="/api/echo?n=21">Route Handler (dynamic)</Link>
        </li>
        <li>
          <Link href="/api/version">Route Handler (force-static)</Link>
        </li>
      </ul>
    </main>
  );
}
