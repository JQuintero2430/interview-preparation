import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VideoPlayer, type PlayerHandle } from './VideoPlayer';
import { LegacyVideoPlayer } from './LegacyVideoPlayer';
import { VideoControls } from './VideoControls';

// jsdom has no media playback: play() and pause() are not implemented, so stub them.
function stubMedia() {
  return {
    play: vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined),
    pause: vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {}),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

test('the Play and Pause buttons call play()/pause() on the underlying <video>', async () => {
  const { play, pause } = stubMedia();
  const user = userEvent.setup();
  render(<VideoControls src="/clip.mp4" />);
  const video = screen.getByLabelText('Product demo');

  await user.click(screen.getByRole('button', { name: 'Play' }));
  expect(play).toHaveBeenCalledTimes(1);
  expect(play.mock.contexts[0]).toBe(video); // `this` was our <video>

  await user.click(screen.getByRole('button', { name: 'Pause' }));
  expect(pause).toHaveBeenCalledTimes(1);
  expect(pause.mock.contexts[0]).toBe(video);
});

test('the handle exposes only play and pause, not the DOM node', () => {
  stubMedia();
  const handle = createRef<PlayerHandle>();
  render(<VideoPlayer ref={handle} src="/clip.mp4" label="Clip" />);

  expect(handle.current).not.toBeInstanceOf(HTMLMediaElement);
  expect(Object.keys(handle.current ?? {})).toEqual(['play', 'pause']);
});

test('the forwardRef version exposes the same handle', () => {
  const { pause } = stubMedia();
  const handle = createRef<PlayerHandle>();
  render(<LegacyVideoPlayer ref={handle} src="/clip.mp4" label="Clip" />);

  expect(Object.keys(handle.current ?? {})).toEqual(['play', 'pause']);
  handle.current?.pause();
  expect(pause).toHaveBeenCalledTimes(1);
});

test('the handle is detached (null) after unmount', () => {
  const handle = createRef<PlayerHandle>();
  const { unmount } = render(<VideoPlayer ref={handle} src="/clip.mp4" label="Clip" />);
  unmount();
  expect(handle.current).toBeNull();
});
