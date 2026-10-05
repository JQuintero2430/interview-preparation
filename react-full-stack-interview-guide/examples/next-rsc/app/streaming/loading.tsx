// loading.tsx wraps page.tsx in a <Suspense> boundary whose fallback is this component.
export default function Loading() {
  return <p>Loading the dashboard shell…</p>;
}
