const lowLevel = new Error('ECONNRESET');
console.log(new Error('save failed', { cause: lowLevel }));
