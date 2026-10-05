import { useLoaderData } from 'react-router';

export type ReportsData = { total: number };

/** Lives in the lazy chunk with the component: both arrive together, and only when /reports is visited. */
export function loader(): ReportsData {
  return { total: 42 };
}

export function Component() {
  const { total } = useLoaderData<ReportsData>();
  return <h1>Reports ({total})</h1>;
}
