/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComputedRef, Ref, WritableComputedRef, isRef } from "../index";
import { Guard } from "../../shared";

export type MaybeRef<T = any> = T | Ref<T> | WritableComputedRef<T>;
export type MaybeRefOrGetter<T = any> = MaybeRef<T> | ComputedRef<T> | (() => T);


export function unref<T>(ref: MaybeRef<T> | ComputedRef<T>): T {
  return isRef(ref) ? ref.value : ref;
}

export function toValue<T>(source: MaybeRefOrGetter<T>): T {
  return Guard.isFunction(source) ? source() : unref(source);
}
