/* eslint-disable @typescript-eslint/no-explicit-any */
import { Func, Guard } from ".";

type TypeOfMap = {
  string: string;
  number: number;
  boolean: boolean;
  function: Func;
  symbol: symbol;
  bigint: bigint;
  undefined: undefined;
  object: object;
  //typeof null === "object" therefore we expand to give it a notion of null
  null: null;
};

export type AssertTypeFn<T> = (val: unknown) => asserts val is T;
export type AssertTypeOfFn<T> = (val: unknown, type: T) => asserts val is T;

export function typeOf<T extends keyof TypeOfMap>(
  val: unknown,
  typeName: T
): asserts val is TypeOfMap[T] {
  //make it null aware
  const valType = val === null ? val : typeof val;
  
  if (typeName === "object") {
    if (val !== null) { return; };
    throw new Error(`Expected ${typeName}, got ${valType}`);
  }

  if (typeName === "null") {
    if (val === null) { return; };
    throw new Error(`Expected null, got ${typeof val}`);
  }

  if (typeof val !== typeName) {
    throw new Error(`Expected ${typeName}, got ${valType}`);
  }
}

export function condition(condition: unknown, msg?: string): asserts condition {
  if (condition === false) throw new Error(msg);
}

export function instanceOf<T>(val: unknown, ctor: new (...args: any[]) => T): asserts val is T {
  if (!(val instanceof ctor)) {
    throw new Error(`[AssertionError] Expected instance of ${ctor.name}`);
  }
}

export function defined<T>(val: unknown, msg?: string): asserts val is NonNullable<T> {
  const message = Guard.isString(msg) ? msg : `Expected value to be defined but got ${val}`;
  if (val == null) throw new Error(`[AssertionError] ${message}`);
  
}

