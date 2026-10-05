'use client';

import { useState } from 'react';

// Everything this file imports, and everything it renders, is part of the client bundle.
// Props crossing the boundary must be serializable: numbers and strings, yes; functions, no.
export function LikeButton({ initialLikes }: { initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  return (
    <button type="button" onClick={() => setLikes((n) => n + 1)}>
      Like ({likes})
    </button>
  );
}
