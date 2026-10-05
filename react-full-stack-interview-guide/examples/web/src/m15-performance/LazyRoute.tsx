import { lazy, Suspense, useState } from 'react';

// The dynamic import() is the split point: bundlers (Vite/Rolldown, webpack) emit ReportsPage
// and everything only it imports as a separate chunk, fetched the first time this runs.
export const loadReports = () => import('./ReportsPage');

// Declared at module level. Declaring it inside a component would create a new component type
// on every render and reset its state (react.dev, `lazy` caveats).
const ReportsPage = lazy(loadReports);

type Page = 'home' | 'reports';

/** Starts downloading the chunk on intent (hover or focus), before the click. */
function preloadReports() {
  void loadReports();
}

/** A two-page app whose second page is code-split. */
export function LazyApp() {
  const [page, setPage] = useState<Page>('home');

  return (
    <div>
      <nav aria-label="Main">
        <button type="button" onClick={() => setPage('home')}>
          Home
        </button>
        <button
          type="button"
          onClick={() => setPage('reports')}
          onMouseEnter={preloadReports}
          onFocus={preloadReports}
        >
          Reports
        </button>
      </nav>
      <Suspense fallback={<p role="status">Loading reports…</p>}>
        {page === 'home' ? <h2>Home</h2> : <ReportsPage />}
      </Suspense>
    </div>
  );
}
