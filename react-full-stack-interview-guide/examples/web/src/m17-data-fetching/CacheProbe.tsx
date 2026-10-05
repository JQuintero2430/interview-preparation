import { useQuery } from '@tanstack/react-query';
import { API, fetchJson } from './api';

export const PROBE_URL = `${API}/probe`;
export const PROBE_KEY = ['probe'] as const;

/** Every DISTINCT `status/fetchStatus` pair the probe renders, in order (repeats are collapsed). */
export const probeLog: string[] = [];

function useProbeLog(entry: string) {
  if (probeLog.at(-1) !== entry) probeLog.push(entry);
}

type Probe = { version: number };

/**
 * A query whose only job is to be observed: it logs its two status fields on every render.
 * @param staleTime - How long fetched data counts as fresh.
 * @param gcTime - How long the cache entry survives with no observer; omitted = client default.
 */
export function CacheProbe({ staleTime = 0, gcTime }: { staleTime?: number; gcTime?: number }) {
  const query = useQuery({
    queryKey: PROBE_KEY,
    queryFn: ({ signal }) => fetchJson<Probe>(PROBE_URL, { signal }),
    staleTime,
    // Spread only when given: `gcTime: undefined` would override the client's default.
    ...(gcTime === undefined ? {} : { gcTime }),
  });
  useProbeLog(`${query.status}/${query.fetchStatus}`);

  return (
    <div>
      <p>{query.data ? `version ${query.data.version}` : 'no data'}</p>
      <button onClick={() => void query.refetch()}>Refetch</button>
    </div>
  );
}
