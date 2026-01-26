import * as Guard from "./is";
import * as Assert from "./assert";
import { Func } from "./utils/functions";

const hasOwnProperty = Object.prototype.hasOwnProperty;
export const hasOwn = (val: object, key: string | symbol): key is keyof typeof val => hasOwnProperty.call(val, key);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const def = (obj: object, key: string | symbol, value: any, writable = false): void => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    writable,
    value
  });
};

export * from "./utils";
export { Guard, Assert };

export const stubFn: Func = <TRet>() => void 0 as unknown as TRet;

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const wrapArray = <T>(val?: T | T[] | undefined | null): T[] => {
  if (Guard.isNullish(val)) return [] as T[];
  if (!Guard.isArray(val)) return [val] as T[];
  return val;
};
import "./core";