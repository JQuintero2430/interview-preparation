// Context APIs you will READ in older codebases, side by side. The module text gives the migration.
import { Component, createContext, type ContextType, type ReactNode } from 'react';

export const LocaleContext = createContext('en-US');

// 1) React 16.3–18 provider syntax. Still works in 19: `LocaleContext.Provider === LocaleContext`.
export function OldProvider({ locale, children }: { locale: string; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

// 2) Render-prop consumer (16.3+). Works anywhere, including class render methods.
export function ConsumerLabel() {
  return <LocaleContext.Consumer>{(locale) => <p>Consumer sees {locale}</p>}</LocaleContext.Consumer>;
}

// 3) static contextType (16.6+): one context per class, read as this.context.
export class ClassLabel extends Component {
  static contextType = LocaleContext;
  declare context: ContextType<typeof LocaleContext>;

  render() {
    return <p>Class sees {this.context}</p>;
  }
}

// 4) Legacy context (childContextTypes / getChildContext / contextTypes): REMOVED in React 19.
//    React 19 logs an error for each class and passes no value down.
export class LegacyColorProvider extends Component<{ children: ReactNode }> {
  static childContextTypes = { color: () => null };

  getChildContext() {
    return { color: 'purple' };
  }

  render() {
    return this.props.children;
  }
}

export class LegacyColorLabel extends Component {
  static contextTypes = { color: () => null };

  render() {
    const color = (this.context as { color?: string } | undefined)?.color;
    return <p>Legacy color: {color ?? 'none'}</p>;
  }
}
