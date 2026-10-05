// Server-only data access (it runs only because a Server Component imports it).
export type Comment = { id: number; author: string; text: string };
export type Post = { id: number; title: string; likes: number; publishedAt: string; comments: Comment[] };

const POST: Post = {
  id: 1,
  title: 'Server Components in one page',
  likes: 41,
  publishedAt: '2026-09-09T00:00:00.000Z', // an ISO string: Dates are serializable, but strings are the safe default
  comments: [
    { id: 1, author: 'Ada', text: 'The island is the only part that ships JavaScript.' },
    { id: 2, author: 'Linus', text: 'This list rendered on the server.' },
  ],
};

/** Stands in for a database call. */
export async function getPost(id: number): Promise<Post | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  return id === POST.id ? POST : undefined;
}
