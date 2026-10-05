import { useImperativeHandle, useRef, type Ref } from 'react';

// The only operations a parent may perform. The <video> element itself stays private.
export type PlayerHandle = {
  play: () => Promise<void>;
  pause: () => void;
};

type Props = {
  src: string;
  label: string;
  ref?: Ref<PlayerHandle>; // React 19: ref is a regular prop on function components
};

export function VideoPlayer({ src, label, ref }: Props) {
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
}
