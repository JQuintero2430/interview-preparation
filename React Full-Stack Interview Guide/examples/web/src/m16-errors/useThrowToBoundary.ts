import { useCallback, useState } from 'react';

/**
 * The plain-React way to hand an error from async code (a promise callback, a timer, an
 * event handler) to the nearest error boundary.
 *
 * Boundaries only catch errors thrown while React renders. So throw from inside a state
 * updater: React runs updaters during the next render, and the error surfaces there.
 * @returns A stable function; call it with the error to show the nearest boundary.
 */
export function useThrowToBoundary(): (error: unknown) => void {
  const [, setState] = useState(0);
  return useCallback((error: unknown) => {
    setState(() => {
      throw error;
    });
  }, []);
}
