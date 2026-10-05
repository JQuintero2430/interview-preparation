import { notFound } from 'next/navigation';
import { Collapsible } from './Collapsible';
import { getPost } from './data';
import { LikeButton } from './LikeButton';

// A Server Component: async, awaits data directly, ships no JavaScript of its own.
// `next build` 16.3.8 output (predicted, then confirmed by running it) (no dynamic API is used and Cache Components is off): "○ /rsc-island" (Static).
// The "rendered at" line is therefore frozen at BUILD time: it is a demonstration, not a clock.
export default async function RscIslandPage() {
  const post = await getPost(1);
  if (!post) notFound();

  return (
    <main>
      <h1>{post.title}</h1>
      <p>Published {new Date(post.publishedAt).toISOString().slice(0, 10)}</p>
      <p>Rendered at {new Date().toISOString()} (build time for a static route)</p>

      {/* The island: the only interactive piece. Receives a plain number. */}
      <LikeButton initialLikes={post.likes} />

      {/* Slot pattern: the Server Component list is passed as children of a Client Component. */}
      <Collapsible title="comments">
        <ul>
          {post.comments.map((comment) => (
            <li key={comment.id}>
              <strong>{comment.author}:</strong> {comment.text}
            </li>
          ))}
        </ul>
      </Collapsible>
    </main>
  );
}
