/** A request to the prime finder: `id` comes back unchanged so the sender can drop stale answers. */
export interface PrimeRequest {
  id: number;
  limit: number;
}

/** The answer to one request: every prime up to the request's limit, in ascending order. */
export interface PrimeResponse {
  id: number;
  primes: number[];
}

/**
 * Lists the primes from 2 up to and including `limit` by trial division.
 * @param limit - Upper bound; a value below 2 gives an empty list.
 * @returns The primes in ascending order.
 */
export function primesUpTo(limit: number): number[] {
  const primes: number[] = [];
  for (let candidate = 2; candidate <= limit; candidate++) {
    if (isPrime(candidate)) primes.push(candidate);
  }
  return primes;
}

// Trial division on purpose: a sieve would finish before a frame is missed, and the exercise needs work that is long enough to block a page.
function isPrime(candidate: number): boolean {
  for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
    if (candidate % divisor === 0) return false;
  }
  return true;
}
