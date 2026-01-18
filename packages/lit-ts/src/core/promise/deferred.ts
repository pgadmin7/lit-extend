import { Guard } from "../../shared";

if (Guard.isUndefined(Promise.withResolvers)) {
  function __withResolvers<T, TError = unknown>(): PromiseWithResolvers<T, TError> {
    let resolve: PromiseWithResolvers<T, TError>["resolve"];
    let reject: PromiseWithResolvers<T, TError>["reject"];
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve: resolve!, reject: reject! };
  }

  Object.defineProperty(Promise, "withResolvers", {
    value: __withResolvers,
    writable: false,
    configurable: false,
    enumerable: false
  });
}

declare global {
  export type PromiseWithResolvers<T, TError = unknown> = {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: TError) => void;
  };

  interface PromiseConstructor {
    /**
     * Create a deferred promise, with exposed resolve and reject methods
     * which can be called separately.
     * This is useful when you want to return a Promise
     * and have code outside the Promise resolve or reject it.
     */
    withResolvers<T, TError = unknown>(): PromiseWithResolvers<T, TError>;
    /**
     * Creates a new Promise and returns it in an object, along with its resolve and reject functions.
     *
     * @returns {PromiseWithResolvers<T>} An object with the properties promise, resolve, and reject.
     */
    withResolvers<T, TError = unknown>(): {
      promise: Promise<T>;
      resolve: (value: T | PromiseLike<T>) => void;
      reject: (reason?: TError) => void;
    };
  }
}

export {};

