export let count = 0;
export default count;
export { count as liveDefault };

export function increment() {
  count += 1;
}
