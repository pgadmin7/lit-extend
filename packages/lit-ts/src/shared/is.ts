import { AsyncFunc, Func } from "./utils";

export const arrayEmpty = [] as const;
export const NOOP = (): void => {};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const isIterable = <T = unknown>(value: unknown): value is Iterable<T> => {
  return value != null && typeof (value as any)[Symbol.iterator] === "function";
};
export const isArrayLike = <T = unknown>(value: unknown): value is ArrayLike<T> => {
  return (
    value != null &&
    typeof value === "object" &&
    typeof (value as any).length === "number" &&
    (value as any).length >= 0 &&
    Number.isInteger((value as any).length)
  );
};

const is = (value: unknown, type: string): boolean => Object.prototype.toString.call(value) === `[object ${type}]`;
export const getRawType = (value: unknown): string => {
  // extract "RawType" from strings like "[object RawType]"
  return Object.prototype.toString.call(value).slice(8, -1);
};

export const isString = (val: unknown): val is string => typeof val === "string";
export const isSymbol = (val: unknown): val is symbol => typeof val === "symbol";

export const isRegExp = (val: unknown): val is RegExp => is(val, "RegExp");
export const isPlainObject = (val: unknown): val is typeof Object => is(val, "Object");
export const isDate = (val: unknown): val is Date => is(val, "Date");

export const isArray = Array.isArray;
export const isFunction = (val: unknown): val is Func => is(val, "Function");
export const isAsyncFunction = (val: unknown): val is AsyncFunc => is(val, "AsyncFunction");
export const isFunctionLike = (val: unknown): val is Func => isFunction(val) || isAsyncFunction(val);
export const isMap = (val: unknown): val is Map<any, any> => is(val, "Map");
export const isSet = (val: unknown): val is Set<any> => is(val, "Set");
export const isWeakMap = (val: unknown): val is WeakMap<any, any> => is(val, "WeakMap");
export const isWeakSet = (val: unknown): val is WeakSet<any> => is(val, "WeakSet");
export const isWeak = (val: unknown) => isWeakMap(val) || isWeakSet(val);

export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === "object";
export const isPromise = <T = any>(val: unknown): val is Promise<T> => {
  return (isObject(val) || isFunction(val)) && isFunction((val as any).then) && isFunction((val as any).catch);
};

export const isUndefined = (value: unknown): value is undefined => value === undefined;
export const isNull = (value: unknown): value is null => value === null;
export const isNullish = (value: unknown): value is null => value == null;
export const isNotUndefined = (value: unknown): value is unknown => value !== undefined;
export const isNotNull = (value: unknown): value is unknown => value !== null;
export const isNotNullish = (value: unknown): value is unknown => value != null;

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const isSubclassOf = (subclass: Function, superclass: Function) =>
  subclass === superclass || Object.prototype.isPrototypeOf.call(superclass.prototype, subclass.prototype);
export const isConstructor = (val: unknown): val is new (...args: any[]) => unknown =>
  isFunction(val) && Function.prototype.toString.call(val).trim().startsWith("class");

export const isNumber = (val: unknown): val is number => val != null && val === +val;
