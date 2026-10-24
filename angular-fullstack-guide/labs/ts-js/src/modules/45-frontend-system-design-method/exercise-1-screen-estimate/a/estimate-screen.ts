// Exercise 45.1, variant a (the solution): a depth-first search that remembers the longest chain ending at each request.
import { indexDependencies, longest, toVerdict, type Budget, type ScreenSpec, type Verdict } from '../screen';

export function estimateScreen(screen: ScreenSpec, budget: Budget): Verdict {
  const dependencies = indexDependencies(screen);
  const chains = new Map<string, readonly string[]>();
  const visiting: string[] = [];

  // The longest chain that ends at `id`: its slowest prerequisite's chain, then `id`, because that prerequisite finishes last.
  const chainTo = (id: string): readonly string[] => {
    const known = chains.get(id);
    if (known) return known;
    const start = visiting.indexOf(id);
    if (start >= 0) throw new Error(`dependency cycle: ${[...visiting.slice(start), id].join(' -> ')}`);
    visiting.push(id);
    const before = longest((dependencies.get(id) ?? []).map(chainTo));
    visiting.pop();
    const chain = [...before, id];
    chains.set(id, chain);
    return chain;
  };

  return toVerdict(screen, budget, longest(screen.requests.map((request) => chainTo(request.id))));
}
