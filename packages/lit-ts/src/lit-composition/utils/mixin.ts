import type { LitElement } from "lit";
import { Constructor } from "../../shared";
export type Mixin<
  Type,
  BaseClass extends typeof LitElement & Constructor<Type> = typeof LitElement & Constructor<Type>,
  Result extends BaseClass = BaseClass
> = (base: BaseClass) => Result;

type ApplyMixins<TBase extends Constructor<unknown>, TMixins extends readonly unknown[]> = TMixins extends readonly []
  ? TBase
  : TMixins extends readonly [infer First, ...infer Rest]
    ? First extends (base: Constructor<unknown> & typeof LitElement) => Constructor<infer R>
      ? TBase & ApplyMixins<Constructor<R>, Rest>
      : never
    : TBase;

export const mixin = <TBase extends Constructor<unknown>, TMixins extends readonly Mixin<unknown>[]>(
  base: TBase,
  ...mixins: TMixins
): ApplyMixins<TBase, TMixins> =>
  mixins.reduce(
    (ctor: Constructor<unknown>, mixinFn: Mixin<unknown>) => mixinFn(ctor as Constructor<unknown> & typeof LitElement),
    base as Constructor<unknown>
  ) as ApplyMixins<TBase, TMixins>;
