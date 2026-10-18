import { PrimeRequest, PrimeResponse, primesUpTo } from './primes';

addEventListener('message', (event: MessageEvent<PrimeRequest>) => {
  const { id, limit } = event.data;
  const response: PrimeResponse = { id, primes: primesUpTo(limit) };
  postMessage(response);
});
