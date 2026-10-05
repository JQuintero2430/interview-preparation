import { act, renderHook } from '@testing-library/react';
import { useOnlineStatusSync } from './useOnlineStatusSync';

function setOnline(online: boolean) {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(online);
  act(() => {
    window.dispatchEvent(new Event(online ? 'online' : 'offline'));
  });
}

afterEach(() => vi.restoreAllMocks());

test('tracks online/offline events without an effect or a state copy', () => {
  const { result } = renderHook(() => useOnlineStatusSync());
  expect(result.current).toBe(true);
  setOnline(false);
  expect(result.current).toBe(false);
  setOnline(true);
  expect(result.current).toBe(true);
});

test('removes both listeners on unmount', () => {
  const remove = vi.spyOn(window, 'removeEventListener');
  const { unmount } = renderHook(() => useOnlineStatusSync());
  unmount();
  expect(remove).toHaveBeenCalledWith('online', expect.any(Function));
  expect(remove).toHaveBeenCalledWith('offline', expect.any(Function));
});
