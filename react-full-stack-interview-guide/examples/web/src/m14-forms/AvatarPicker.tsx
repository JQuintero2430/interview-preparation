import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';

export const MAX_AVATAR_BYTES = 1024 * 1024;
export const AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const BYTES_PER_KB = 1024;

/** Pure validation, so the rules are testable without a DOM. Returns a message or null. */
export function validateAvatar(file: File): string | null {
  if (!AVATAR_TYPES.includes(file.type)) return 'Choose a PNG, JPEG or WebP image';
  if (file.size > MAX_AVATAR_BYTES) return 'The image must be 1 MB or smaller';
  return null;
}

type Props = { onChange?: (file: File | null) => void };

/**
 * A file input is always uncontrolled: its value can only be set by the user (or cleared).
 * We keep the accepted File in state and render a preview from it.
 */
export function AvatarPicker({ onChange }: Props) {
  const id = useId();
  const errorId = `${id}-error`;
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    const problem = picked ? validateAvatar(picked) : null;
    const accepted = problem ? null : picked;
    setError(problem);
    setFile(accepted);
    onChange?.(accepted);
  }

  return (
    <div>
      <label htmlFor={id}>Profile picture</label>
      <input
        id={id}
        type="file"
        accept={AVATAR_TYPES.join(',')} // a hint for the picker, not validation
        onChange={handleChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} role="alert" aria-live="polite">
          {error}
        </p>
      )}
      {file && <AvatarPreview file={file} />}
    </div>
  );
}

/**
 * An object URL is an external resource (it pins the file in memory until revoked), so creating
 * and revoking it is an effect. Setting img.src through a ref avoids setState inside the effect,
 * and it survives Strict Mode: cleanup revokes URL #1, the re-run creates URL #2.
 */
function AvatarPreview({ file }: { file: File }) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const url = URL.createObjectURL(file);
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <figure>
      <img ref={imgRef} alt={`Preview of ${file.name}`} width={96} height={96} />
      <figcaption>
        {file.name} ({Math.ceil(file.size / BYTES_PER_KB)} KB)
      </figcaption>
    </figure>
  );
}
