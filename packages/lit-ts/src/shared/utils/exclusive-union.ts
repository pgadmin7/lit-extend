/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type MergeAllTypes<TCollection extends any[], TResult = {}> = TCollection extends [
  infer THead,
  ...infer TRemaining
]
  ? MergeAllTypes<TRemaining, TResult & THead>
  : TResult;

export type OnlyFirst<TFirst, TRest> = TFirst & { [K in keyof Omit<TRest, keyof TFirst>]?: never };

export type OneOf<
  TCollection extends any[],
  TResult = never,
  TAllProps = MergeAllTypes<TCollection>
> = TCollection extends [infer THead, ...infer TRemaining]
  ? OneOf<TRemaining, TResult | OnlyFirst<THead, TAllProps>, TAllProps>
  : TResult;
