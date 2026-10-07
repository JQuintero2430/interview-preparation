console.log('from node', typeof require);
console.error('to stderr');
process.exitCode = 3;
