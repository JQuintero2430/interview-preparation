import { act, renderHook } from '@testing-library/react';
import { useOnlineStatus } from './useOnlineStatus';

function goOffline(offline: boolean) {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(!offline);
  act(() => {
    window.dispatchEvent(new Event(offline ? 'offline' : 'online'));
  });
}

afterEach(() => vi.restoreAllMocks());

test('tracks online/offline events', () => {
  const { result } = renderHook(() => useOnlineStatus());
  expect(result.current).toBe(true);
  goOffline(true);
  expect(result.current).toBe(false);
  goOffline(false);
  expect(result.current).toBe(true);
});

test('removes its listeners on unmount', () => {
  const remove = vi.spyOn(window, 'removeEventListener');
  const { unmount } = renderHook(() => useOnlineStatus());
  unmount();
  expect(remove).toHaveBeenCalledWith('online', expect.any(Function));
  expect(remove).toHaveBeenCalledWith('offline', expect.any(Function));
});
