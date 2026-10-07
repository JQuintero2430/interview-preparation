globalThis.runs = (globalThis.runs ?? 0) + 1;
if (globalThis.runs === 1) throw new Error('boom');
