// Runs Lighthouse (Node API) against a page of the production build, on the Chromium Playwright installed (HOUSE-22).
// Wiring: Playwright launches Chromium with a remote-debugging port; Lighthouse connects to that port and opens its own tab.
import { createServer } from 'node:net';
import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';

/** A free TCP port, picked by the OS. */
function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer().listen(0, () => {
      const address = server.address();
      server.close(() => (typeof address === 'object' && address ? resolve(address.port) : reject(new Error('No port'))));
    });
  });
}

/** The Lighthouse result (`lhr`) for the performance category only. */
export async function runLighthouse(url = 'http://localhost:4300/m31/home') {
  const port = await freePort();
  const browser = await chromium.launch({ args: [`--remote-debugging-port=${port}`] });
  try {
    const result = await lighthouse(url, { port, onlyCategories: ['performance'], output: 'json', logLevel: 'error' });
    if (!result) throw new Error('Lighthouse returned no result');
    return result.lhr;
  } finally {
    await browser.close();
  }
}
