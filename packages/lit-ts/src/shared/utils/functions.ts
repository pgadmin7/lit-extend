/* eslint-disable @typescript-eslint/no-explicit-any */
export type AsyncFunc = (...args: any) => Promise<any>;
export type Func = (...args: any) => any;
export type FuncParams<TFunc extends Func> = TFunc extends (...args: infer P) => any ? P : never;
export type FuncRet<TFunc extends Func> = TFunc extends (...args: any) => infer R ? R : never;
export type Fn<TArg extends unknown[] = any[], TRet = any> = (...args: TArg) => TRet;
