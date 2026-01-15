/* eslint-disable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Constructor<T = {}> = new (...args: any[]) => T;

export type Maybe<T> = T | null | undefined;
export type ValueObject<T> = { type: string; value: T };
export type Prettify<T> = { [K in keyof T]: T[K] } & {};
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
export type UnwrapArray<T> = T extends Array<infer V> ? V : T;

export type GetPropType<ThisType, TName extends keyof ThisType> = ThisType[TName];

export type Autocomplete<T extends string> = T | (string & {});

export type IntersectionToUnion<T> = (T extends any ? (x: T) => any : never) extends (x: infer U) => any ? U : never;

export * from "./exclusive-union";
export * from "./overload-union";
export * from "./union-to-tuple";
export * from "./guards";
export * from "./functions";

export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;