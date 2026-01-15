// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (Array.prototype.firstOrDefault === undefined) {
  Object.defineProperty(Array.prototype, "firstOrDefault", {
    value: function <T, TDefault = undefined>(this: T[], fallback?: TDefault): TDefault | T {
      const defaultFallback: TDefault = fallback !== undefined ? fallback : (undefined as TDefault);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (this == null) return defaultFallback;
      if (!Array.isArray(this)) return defaultFallback;
      return this.length > 0 ? (this[0] as T) : defaultFallback;
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
}

declare global {
  interface Array<T> {
    /**
     * Returns the first element of the array, or a fallback value if the array is
     * empty.
     *
     * @template TDefault
     * @param {TDefault} [fallback] Value to return if the array has no elements.
     * @returns {T | TDefault} The first element of the array, or the fallback value.
     *
     * @example
     * [1, 2, 3].firstOrDefault(); // 1
     * [].firstOrDefault(42);      // 42
     * [].firstOrDefault(null);    // null
     * [].firstOrDefault();        // undefined
     */
    firstOrDefault<TDefault = undefined>(fallback?: TDefault): TDefault | T;
  }
}

export {};