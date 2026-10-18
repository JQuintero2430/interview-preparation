/** A request to the prime counter: `id` comes back unchanged so the sender can drop stale answers. */
export interface PrimeRequest {
  id: number;
  limit: number;
}

/** The answer to one request. */
export interface PrimeResponse {
  id: number;
  count: number;
}

/**
 * Counts the primes from 2 up to and including `limit` by trial division.
 * @param limit - Upper bound; a value below 2 counts nothing.
 * @returns How many primes lie in the range.
 */
export function countPrimes(limit: number): number {
  let count = 0;
  for (let candidate = 2; candidate <= limit; candidate++) {
    if (isPrime(candidate)) count++;
  }
  return count;
}

// Trial division on purpose: it is CPU-bound with no allocation, so the work is the computation and not the copying.
function isPrime(candidate: number): boolean {
  for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
    if (candidate % divisor === 0) return false;
  }
  return true;
}
