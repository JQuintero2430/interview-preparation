import { useEffect, useLayoutEffect } from 'react';

// Every render, layout effect and passive effect (and their cleanups) writes to this log.
export const log: string[] = [];

function useLogged(name: string, value: number) {
  log.push(`${name} render ${value}`);
  useLayoutEffect(() => {
    log.push(`${name} layout setup ${value}`);
    return () => void log.push(`${name} layout cleanup ${value}`);
  }, [name, value]);
  useEffect(() => {
    log.push(`${name} effect setup ${value}`);
    return () => void log.push(`${name} effect cleanup ${value}`);
  }, [name, value]);
}

export function Parent({ value }: { value: number }) {
  useLogged('Parent', value);
  return <Child value={value} />;
}

function Child({ value }: { value: number }) {
  useLogged('Child', value);
  return <p>{value}</p>;
}
