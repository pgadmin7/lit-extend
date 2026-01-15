import { ComputedRef, isRef, Ref, WritableComputedRef } from "@yiin/reactive-proxy-state";
import { isFunction } from "../shared/general";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MaybeRef<T = any> = T | Ref<T> | WritableComputedRef<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MaybeRefOrGetter<T = any> = MaybeRef<T> | ComputedRef<T> | (() => T);

export function toValue<T>(source: MaybeRefOrGetter<T>): T {
  if(isFunction(source)){
    return source();
  }
  if(isRef(source)) {
    return source.value
  }
  return source;
}
