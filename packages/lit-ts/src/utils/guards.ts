/* eslint-disable @typescript-eslint/no-explicit-any */
import { Func } from "./functions";

export type IsArray<T, R = never> = T extends Array<any> ? T : R;
export type IsNotArray<T, R = never> = T extends Array<any> ? R : T;

export type IsFunc<T, Strict extends boolean = false> = Strict extends true
  ? [T] extends [Func]
    ? T
    : never
  : T extends Func
    ? T
    : never;
