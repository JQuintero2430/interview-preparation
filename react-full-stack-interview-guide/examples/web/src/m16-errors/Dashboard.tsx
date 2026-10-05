import { ResettableBoundary } from './ResettableBoundary';

export type WidgetSpec = {
  id: string;
  title: string;
  /** Reads the widget's data during render; throws when the data cannot be produced. */
  load: () => string;
};

function WidgetBody({ load }: { load: () => string }) {
  return <p>{load()}</p>;
}

/** 16.8: one boundary per widget, so one failure degrades one tile, not the page. */
export function Dashboard({ widgets }: { widgets: readonly WidgetSpec[] }) {
  return (
    <main>
      <h1>Dashboard</h1>
      {widgets.map((widget) => (
        <section key={widget.id} aria-label={widget.title}>
          <h2>{widget.title}</h2>
          <ResettableBoundary
            fallbackRender={({ reset }) => (
              <div role="alert">
                <p>{widget.title} is unavailable right now.</p>
                <button type="button" onClick={reset}>
                  Retry {widget.title}
                </button>
              </div>
            )}
          >
            <WidgetBody load={widget.load} />
          </ResettableBoundary>
        </section>
      ))}
    </main>
  );
}
