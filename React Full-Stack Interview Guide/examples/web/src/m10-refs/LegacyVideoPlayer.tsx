import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { PlayerHandle } from './VideoPlayer';

// The React 16.3–18 way. Still works in React 19, but `ref` as a prop (VideoPlayer.tsx) replaces it.
export const LegacyVideoPlayer = forwardRef<PlayerHandle, { src: string; label: string }>(
  function LegacyVideoPlayer({ src, label }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(
      ref,
      () => ({
        play: () => videoRef.current?.play() ?? Promise.resolve(),
        pause: () => videoRef.current?.pause(),
      }),
      [],
    );

    return <video ref={videoRef} src={src} aria-label={label} />;
  },
);
