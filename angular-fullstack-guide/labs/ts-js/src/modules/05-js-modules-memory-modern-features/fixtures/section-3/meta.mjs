console.log(import.meta.url.startsWith('file:///'), import.meta.url.endsWith('/section-3/meta.mjs'));
console.log(import.meta.filename.endsWith('meta.mjs'), import.meta.dirname.endsWith('section-3'));
console.log(import.meta.resolve('./config.json').endsWith('/section-3/config.json'));
