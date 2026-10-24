// Output question Q46.06: our feed pager (concepts/feed-pager.ts, our model after 41 section 6, not a library's code) over
// three cursor pages that overlap (posts 30-21, 21-12, 12-5; a post's id is "p" plus its number, its time is that number)
// and two live arrivals: post 31 (new) and post 21 (already shown).
import { createFeedPager, type Post } from '../../modules/46-system-design-case-studies/concepts/feed-pager';
import { captureLogs } from '../capture';

const post = (n: number): Post => ({ id: `p${n}`, publishedAt: n });
const range = (from: number, to: number): Post[] => Array.from({ length: from - to + 1 }, (_, i) => post(from - i));

describe('46 · Q46.06', () => {
  it('Q46.06 our feed pager buffers one live post', async () => {
    const pager = createFeedPager();

    const lines = await captureLogs((log) => {
      pager.addPage({ items: range(30, 21), nextCursor: 'c2' });
      pager.addPage({ items: range(21, 12), nextCursor: 'c3' });
      pager.addPage({ items: range(12, 5), nextCursor: null });
      pager.receiveLive(post(31));
      pager.receiveLive(post(21));

      const ids = pager.view().map((p) => p.id);
      log(`after 3 pages: ${ids.length} posts, ${ids.at(0)} to ${ids.at(-1)}, p21 x${ids.filter((id) => id === 'p21').length}`);
      log(`pill: ${pager.pendingCount()} new`);

      pager.showNew();
      const after = pager.view().map((p) => p.id);
      log(`after showNew: ${after.length} posts, ${after.at(0)} to ${after.at(-1)}, pill ${pager.pendingCount()}`);
    });

    expect(lines).toEqual([
      'after 3 pages: 26 posts, p30 to p5, p21 x1',
      'pill: 1 new',
      'after showNew: 27 posts, p31 to p5, pill 0',
    ]);
  });
});
