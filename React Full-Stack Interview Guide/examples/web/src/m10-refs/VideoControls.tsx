import { useRef } from 'react';
import { VideoPlayer, type PlayerHandle } from './VideoPlayer';

// The parent drives the player through its handle, not through the <video> element.
export function VideoControls({ src }: { src: string }) {
  const playerRef = useRef<PlayerHandle>(null);

  return (
    <section>
      <VideoPlayer ref={playerRef} src={src} label="Product demo" />
      <button type="button" onClick={() => void playerRef.current?.play()}>
        Play
      </button>
      <button type="button" onClick={() => playerRef.current?.pause()}>
        Pause
      </button>
    </section>
  );
}
