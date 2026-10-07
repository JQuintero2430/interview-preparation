// Output questions for module 03, section 8 (iteration protocols and generators), and the
// evidence for the Q03.19a design question.
import { captureLogs } from '../capture';

describe('03 · iterators and generators', () => {
  it('Q03.19 next(value), early exit from for...of, and return()', async () => {
    const lines = await captureLogs((log) => {
      function* ids(): Generator<number, unknown, boolean | undefined> {
        try {
          let i = 1;
          while (true) {
            const reset = yield i++;
            if (reset) i = 1;
          }
        } finally {
          log('cleanup');
        }
      }
      const gen = ids();
      log(gen.next().value, gen.next().value, gen.next(true).value);
      for (const id of ids()) {
        if (id > 2) break;
        log('id', id);
      }
      log(JSON.stringify(gen.return(42)), JSON.stringify(gen.next()));
    });
    expect(lines).toEqual([
      '1 2 1',
      'id 1',
      'id 2',
      'cleanup',
      'cleanup',
      '{"value":42,"done":true} {"done":true}',
    ]);
  });

  it('Q03.20 iterators are one-shot, and iterator helpers are lazy', async () => {
    const lines = await captureLogs((log) => {
      const once = [1, 2, 3].values();
      log([...once].join(), [...once].length);
      const nums = [1, 2, 3, 4].values();
      const evens = nums.filter((n) => {
        log(`check ${n}`);
        return n % 2 === 0;
      });
      log('created');
      log(evens.next().value);
      log([...nums].join());
    });
    expect(lines).toEqual(['1,2,3 0', 'created', 'check 1', 'check 2', '2', '3,4']);
  });

  it('Q03.19a a recursive generator with yield* walks lazily and closes every level on early exit', async () => {
    const lines = await captureLogs((log) => {
      interface MenuNode {
        label: string;
        children?: readonly MenuNode[];
      }
      function* walk(node: MenuNode, depth = 0): Generator<[string, number]> {
        try {
          yield [node.label, depth];
          for (const child of node.children ?? []) yield* walk(child, depth + 1);
        } finally {
          log('close', node.label);
        }
      }
      const menu: MenuNode = {
        label: 'root',
        children: [{ label: 'files', children: [{ label: 'open' }, { label: 'save' }] }, { label: 'help' }],
      };
      for (const [label, depth] of walk(menu)) {
        log('visit', label, depth);
        if (label === 'open') break;
      }
    });
    expect(lines).toEqual(['visit root 0', 'visit files 1', 'visit open 2', 'close open', 'close files', 'close root']);
  });

  it('Q03.19a yield* evaluates to the return value of the inner generator', async () => {
    const lines = await captureLogs((log) => {
      function* inner(): Generator<number, string> {
        yield 1;
        return 'done';
      }
      function* outer(): Generator<number, void> {
        const result = yield* inner();
        log('inner returned', result);
      }
      log([...outer()].join());
    });
    expect(lines).toEqual(['inner returned done', '1']);
  });

  it('Q03.19a a very deep chain of yield* exhausts the call stack', () => {
    interface ChainNode {
      children?: readonly ChainNode[];
    }
    function* walk(node: ChainNode): Generator<ChainNode> {
      yield node;
      for (const child of node.children ?? []) yield* walk(child);
    }
    const chain = (levels: number): ChainNode => {
      let root: ChainNode = {};
      for (let i = 1; i < levels; i++) root = { children: [root] };
      return root;
    };
    expect([...walk(chain(100))]).toHaveLength(100);
    expect(() => [...walk(chain(100_000))]).toThrow(RangeError);
  });
});
