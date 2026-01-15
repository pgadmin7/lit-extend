export * from "./deferred";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function wrapAsync<T extends any[], R>(fn: (...args: T) => R | Promise<R>) {
  return (...args: T): Promise<R> => Promise.resolve(fn(...args));
}