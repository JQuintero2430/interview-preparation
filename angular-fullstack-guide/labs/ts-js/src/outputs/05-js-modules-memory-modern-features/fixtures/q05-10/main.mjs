import settings from './settings.json' with { type: 'json' };

const again = await import('./settings.json', { with: { type: 'json' } });
console.log(settings.theme, again.default === settings, Object.keys(again));
console.log(import.meta.dirname === new URL('.', import.meta.url).pathname.slice(0, -1));
try {
  await import('./settings.json');
} catch (error) {
  console.log(error.code);
}
