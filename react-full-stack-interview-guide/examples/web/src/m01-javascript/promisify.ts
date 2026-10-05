/** The Node-style callback: error first, result second. */
export type NodeCallback<T> = (error: Error | null, value?: T) => void;

/** callback -> promise: the migration step between 2012-style Node code and async/await. */
export function promisify<A extends unknown[], T>(
  fn: (...args: [...A, NodeCallback<T>]) => void,
): (...args: A) => Promise<T> {
  return (...args: A) =>
    new Promise<T>((resolve, reject) => {
      fn(...args, (error, value) => {
        if (error) reject(error);
        else resolve(value as T);
      });
    });
}
