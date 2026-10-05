import { useId, useState, type KeyboardEvent, type ReactNode } from 'react';

export type TabItem = { id: string; label: string; content: ReactNode };

/** Data-driven tabs with automatic activation (arrow keys move focus AND select). */
export function SimpleTabs({ tabs, label }: { tabs: TabItem[]; label: string }) {
  const baseId = useId();
  const [selectedId, setSelectedId] = useState(tabs[0]?.id);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((tab) => tab.id === selectedId);
    const last = tabs.length - 1;
    const targets: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    const next = targets[event.key];
    const tab = next === undefined ? undefined : tabs[next];
    if (!tab) return;
    event.preventDefault();
    setSelectedId(tab.id);
    // The tab element already exists, so we can focus it before React re-renders.
    event.currentTarget.querySelector<HTMLElement>(`[data-tab="${tab.id}"]`)?.focus();
  }

  const selected = tabs.find((tab) => tab.id === selectedId);

  return (
    <div>
      <div role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${baseId}-tab-${tab.id}`}
            data-tab={tab.id}
            aria-selected={tab.id === selectedId}
            aria-controls={`${baseId}-panel-${tab.id}`}
            tabIndex={tab.id === selectedId ? 0 : -1} // roving tabindex
            onClick={() => setSelectedId(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {selected && (
        <div
          role="tabpanel"
          id={`${baseId}-panel-${selected.id}`}
          aria-labelledby={`${baseId}-tab-${selected.id}`}
          tabIndex={0}
        >
          {selected.content}
        </div>
      )}
    </div>
  );
}
