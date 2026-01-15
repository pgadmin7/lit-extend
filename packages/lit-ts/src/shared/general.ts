/* eslint-disable @typescript-eslint/no-explicit-any */
export const isArray: typeof Array.isArray = Array.isArray;
export const isMap = (val: unknown): val is Map<any, any> => toTypeString(val) === "[object Map]";
export const isSet = (val: unknown): val is Set<any> => toTypeString(val) === "[object Set]";
export const isWeakMap = (val: unknown): val is WeakMap<any, any> => toTypeString(val) === "[object WeakMap]";
export const isWeakSet = (val: unknown): val is WeakSet<any> => toTypeString(val) === "[object WeakSet]";
export const isWeak = (val: unknown) => isWeakMap(val) || isWeakSet(val);

export const isIterable = <T = unknown>(value: unknown): value is Iterable<T> => {
  return value != null && typeof (value as any)[Symbol.iterator] === "function";
}
export const isArrayLike = <T = unknown>(value: unknown): value is ArrayLike<T> => {
  return (
    value != null &&
    typeof value === "object" &&
    typeof (value as any).length === "number" &&
    (value as any).length >= 0 &&
    Number.isInteger((value as any).length)
  );
}

export const isDate = (val: unknown): val is Date => toTypeString(val) === "[object Date]";
export const isRegExp = (val: unknown): val is RegExp => toTypeString(val) === "[object RegExp]";
export const isFunction = (val: unknown): val is (...args: any) => any => typeof val === "function";
export const isString = (val: unknown): val is string => typeof val === "string";
export const isSymbol = (val: unknown): val is symbol => typeof val === "symbol";
export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === "object";

export const isPromise = <T = any>(val: unknown): val is Promise<T> => {
  return (isObject(val) || isFunction(val)) && isFunction((val as any).then) && isFunction((val as any).catch);
};
export const objectToString: typeof Object.prototype.toString = Object.prototype.toString;
export const toTypeString = (value: unknown): string => objectToString.call(value);

export const toRawType = (value: unknown): string => {
  // extract "RawType" from strings like "[object RawType]"
  return toTypeString(value).slice(8, -1);
};

export const isPlainObject = (val: unknown): val is object => toTypeString(val) === "[object Object]";