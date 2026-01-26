/* eslint-disable @typescript-eslint/no-explicit-any */

import { Fn, Guard } from "../../../shared";

if (Guard.isUndefined(Promise.wrapAsync)) {
  function __wrapAsync<TArgs extends any[], TRet>(fn: Fn<TArgs, TRet | Promise<TRet>>) {
    return (...args: TArgs): Promise<TRet> => Promise.resolve(fn(...args));
  }

  Object.defineProperty(Promise, "wrapAsync", {
    value: __wrapAsync,
    writable: false,
    configurable: false,
    enumerable: false
  });
}

declare global {
  interface PromiseConstructor {
    /**
     * Wraps a synchronous or asynchronous function and ensures it always returns a Promise.
     *
     * This is useful for normalizing APIs so callers can consistently use `await`,
     * regardless of whether the original function returns a value or a Promise.
     *
     * @param fn A function that may return a value or a Promise.
     * @returns A new function with the same parameters that always returns a Promise.
     *
     * @example
     * const safeFn = Promise.wrapAsync((x: number) => x * 2);
     * await safeFn(2); // 4
     *
     * @example
     * const safeAsync = Promise.wrapAsync(async (x: number) => x * 2);
     * await safeAsync(2); // 4
     */
    wrapAsync<TArgs extends any[], TRet>(fn: Fn<TArgs, TRet | Promise<TRet>>): (...args: TArgs) => Promise<TRet>;
  }
}

export {};
