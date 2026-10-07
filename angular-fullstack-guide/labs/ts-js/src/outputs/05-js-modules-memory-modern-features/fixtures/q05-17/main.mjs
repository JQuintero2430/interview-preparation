const reset = new Error('ECONNRESET');
const request = new Error('request failed', { cause: reset });
const save = new Error('save failed', { cause: request });

const chain = [];
for (let error = save; error; error = error.cause) chain.push(error.message);
console.log(chain.join(' <- '));
console.log('cause' in new Error('plain'), 'cause' in new Error('x', { cause: undefined }));

const results = await Promise.allSettled([
  Promise.reject(new Error('a.png')),
  Promise.resolve('b.png'),
  Promise.reject(new Error('c.png')),
]);
const failures = results.filter((result) => result.status === 'rejected').map((result) => result.reason);
const batch = new AggregateError(failures, '2 of 3 uploads failed');
console.log(batch.name, '|', batch.message, '|', batch.errors.map((error) => error.message));

try {
  await Promise.any([Promise.reject(new Error('x')), Promise.reject(new Error('y'))]);
} catch (error) {
  console.log(error.name, '|', error.message, '|', error.errors.length);
}
