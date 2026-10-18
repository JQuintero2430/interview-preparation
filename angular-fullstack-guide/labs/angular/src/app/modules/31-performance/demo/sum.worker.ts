import { PrimeRequest, PrimeResponse, countPrimes } from './prime-count';

addEventListener('message', (event: MessageEvent<PrimeRequest>) => {
  const { id, limit } = event.data;
  const response: PrimeResponse = { id, count: countPrimes(limit) };
  postMessage(response);
});
