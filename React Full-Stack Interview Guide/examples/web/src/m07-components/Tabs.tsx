import { createContext, use, useId, type KeyboardEvent, type ReactNode } from 'react';
import { useControllableState } from './useControllableState';

type TabsContextValue = {
  baseId: string;
  selected: string;
  select: (value: string) => void;
};

// The implicit channel between <Tabs> and its parts. Not exported: consumers use the parts.
const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(part: string): TabsContextValue {
  const context = use(TabsContext);
  if (!context) throw new Error(`<${part}> must be rendered inside <Tabs>`);
  return context;
}

type TabsProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  children: ReactNode;
};

/** Root of the compound tabs: owns the selected value (controllable) and shares it via context. */
export function Tabs({ value, defaultValue, onChange, children }: TabsProps) {
  const baseId = useId();
  const [selected, select] = useControllableState({
    value,
    defaultValue: defaultValue ?? value ?? '',
    onChange,
  });

  return <TabsContext value={{ baseId, selected, select }}>{children}</TabsContext>;
}

/** The `tablist`: handles arrow-key, Home and End navigation for the tabs inside it. */
export function TabList({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="tablist" aria-label={label} onKeyDown={moveFocus}>
      {children}
    </div>
  );
}

/** One `tab`; `value` links it to the `TabPanel` with the same value. */
export function Tab({ value, children }: { value: string; children: ReactNode }) {
  const { baseId, selected, select } = useTabsContext('Tab');
  const isSelected = value === selected;

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={isSelected}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={isSelected ? 0 : -1} // roving tabindex: Tab key enters on the selected tab only
      onFocus={() => select(value)} // automatic activation: focusing a tab selects it
      onClick={() => select(value)} // Safari does not focus buttons on click
    >
      {children}
    </button>
  );
}

/** The `tabpanel` for `value`; stays mounted (state kept) but `hidden` when not selected. */
export function TabPanel({ value, children }: { value: string; children: ReactNode }) {
  const { baseId, selected } = useTabsContext('TabPanel');

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      hidden={value !== selected}
      tabIndex={0}
    >
      {children}
    </div>
  );
}

// Arrow keys move focus between tabs (wrapping); Home/End jump to the ends.
// Moving focus is enough, because a focused tab selects itself.
function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
  const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]'));
  const current = tabs.findIndex((tab) => tab === document.activeElement);
  const next = nextIndex(event.key, current, tabs.length);
  if (next === null) return;
  event.preventDefault();
  tabs[next]?.focus();
}

function nextIndex(key: string, current: number, count: number): number | null {
  switch (key) {
    case 'ArrowRight':
      return (current + 1) % count;
    case 'ArrowLeft':
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}
