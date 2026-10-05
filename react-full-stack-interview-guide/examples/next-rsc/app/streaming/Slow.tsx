// An async Server Component: React suspends it until the promise settles.
export async function Slow({ label, ms }: { label: string; ms: number }) {
  await new Promise((resolve) => setTimeout(resolve, ms));
  return (
    <p>
      {label} ready after {ms} ms (rendered {new Date().toISOString()})
    </p>
  );
}
