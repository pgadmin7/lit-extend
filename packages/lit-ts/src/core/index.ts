import { ComputedRef, isRef, Ref, WritableComputedRef } from "../lit-composition";
import { Guard } from "../shared";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MaybeRef<T = any> = T | Ref<T> | WritableComputedRef<T>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MaybeRefOrGetter<T = any> = MaybeRef<T> | ComputedRef<T> | (() => T);

export function toValue<T>(source: MaybeRefOrGetter<T>): T {
  if (Guard.isFunction(source)) {
    return source();
  }
  if(isRef(source)) {
    return source.value
  }
  return source;
}

export * from "./array";
export * from "./promise";
