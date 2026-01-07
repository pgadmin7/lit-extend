/* eslint-disable @typescript-eslint/no-explicit-any */

// SOURCE: https://www.typescriptlang.org/play/?ts=5.9.3#code/C4TwDgpgBA+g8gNwgJwDYHsCGATAqgOwEt18AeAFURQxwBopyAFTZYQzVKtLbKAXigBXfAGt86AO74AfPwbNW7Tkm44oAMgZcavCAA9gEfNgDOUABQBYAFBQoAOkcsA5iYBcUQvgBmKBgEFkVxsASn5ZL19kBgAlCGBBZHwbOwB+KAB6DKhGZAgkfGBPHy9CQyg8gGNEk2J8KAAjECgTYHQwMC9nCohq5FqSKAkACyN5FjYObR4Uu0zs4cwzTErqgFtBVExDXg5UKHRvKGBRrRUdFsJnfG3EiBN7WbsmCaVptX1DYzNKc5nbObpfD5FBPKBuMFzKAAH1g7zwRBIFHh9EYhEqImRfzoUBEEBAhzO1B4sk0L0UU2xvE05nMjnsLncASCJjCfFk5DiCSSIWkkLmsNp9MZHnIgVcbI5XMS+BCsw8wJUAG4bDZQJAoPCCHUscSPgYjKYLMKWR5MPgQABtAC6kqg5pAsgEAFE9JVUIJsBBSLN4FTtUiwVkGKcAETmO2KlChy7XW55KAbVqNaDDdCEVoQXhtY5h7zIEjAGOEk4QIPZLyGfq9NgkejedDRYASdA9JYkJmYMINXqYQQmaBVGp1FptMBmEZjMqeEzlqBGSroYRVrP0c28BphacDiBrMw5sB5ApFUtQReoLbj6CEkyCBoDgCOgiMwDnocXazA20IDVQEBjtRxty9wWBAzj2FA4Z2gg6bYDGlatuGmCpB4ACM0GwaGIS0HOIzosMUDOIQSDLFA2CEFURSLvgKgDPUOaYEIiL4I8AJ2LSkYgsgYRkvCszSDhAK-HqugGt8FicSoUBAlx4ISeEUBRsgNjSCq1g2BkABUNjkKcwDIOiIj7q2p6YA06BID0fR0faeT0qq1hdlAACSPgoAZ+DdKeX7IJgazxH4649Ny9HgCBhLmgcVJZlA3jCJUtb1BIhAXkIA5qqcWzJhZImxjcwH0HhlQERm9odCwL6oM0kX6GAqDotOXqAfUxXppUECsTYm4uYUKADglXT2pcnl-nl8bQMlJy5teBlETc+yVn1NZ1PQlSRXkjZesp1inot1YDYM5hgOgJi1L+1X1MI2DoOsL4xbUXrzt4vgJakISddYlRhK5Vb9YlZhrfUJBVSmPQALSbSgq6KegRQ3MgBYSDF5h5Nggjtdg2FQAAyug9CljYe1-SOizGaDeQNIIKVFF402QeSkzKCJMbOEYKDovjozJNYQ79COgOg607SQLwk70accWpUTy2DKTKZjBTVOoMArFwKWyDJQOnOlS2my8Hkt7K8U9r1JEpTlLzdGsZpGQOcGzp3CImAAIRqmFDD3MA-ioXIWrMaQADeswRh4MGENganschaEhGhkcWJgHgAEz0A0yex1ASdqQAvqpdvZM62Cs1AADCSwQB4UEKUpAFXPldyJv2RQ9lAaYZjsrHqtA5Ce-4Se+-6-tBwCIdQGHEfB9HUDoXHk-J6n6fJ-Ho9KTnefqdY9tF9AZcDh4AAigh1ei2zQM143LAm6BrGUHduxqPetP4ADMA8iQGZDD+xGfj8vU8z9PZeP9YJKnmGRI+9U1qGDnpnBemcM5Z0nihaeGdUKgODGjY+UCyzWFzmpDS2QABysNoAnG2HTSG0RCQ5VUEaUqaxMCVkYcCXgtNTzCBWkMYY+FEwQHNLOTe2QyE02AAAcjMEePqP5Rr9kGoxD+5B0A-SWgdUKGpJwJlPDQnQBCDjIC2ombYv0IK6WgPodqYBEozkghGauXFQyFW4cVVuSxjithbm3TM2BdE5lPPmQsBwji7V6vtRKEEAASkguL0DKOIumawTpFBMJASohBvDojGgVXRRUCL+X4a3dMrRBrbjTHrQWmBfCeCCacDhgxSrURUDsRoKwRBuJNro6WqiPrBlclEDy3RGK1KBkcHyfkApNggeFaIeQQrHDCmYUq4gJBQGOqdaRHV77QHhAoMZv0KDzjEkaOkThTQmytLaBSDonQ5BYLsvqpA-Y6nINIdeXdNRUmlEkcgYV9mfENGYY5DJTkOhtHaK5chPn4G+ZAB5g8nkvPwTtd2j9gAACEfYCG2bc-yeyv4SVDiApBMdZ4j0TrAxoi9M5AIVFxNeiK3kotRf3TFHz4gymhd6PFo9f5EpQSSqO88KXwKXsHDOq8bB4PzlAYh5RTyhhrsFGUcyNSA1Ec3aAXh3Semhj2Na-ZoBDInGUAiSldHXRhjTfAWrHplFYkAA

type _OverloadUnion<TOverload, TPartialOverload = unknown> = TPartialOverload & TOverload extends (
  ...args: infer TArgs
) => infer TReturn
  ? // Prevent infinite recursion by stopping recursion when TPartialOverload
    // has accumulated all of the TOverload signatures.
    TPartialOverload extends TOverload
    ? never
    :
        | _OverloadUnion<TOverload, Pick<TOverload, keyof TOverload> & TPartialOverload & ((...args: TArgs) => TReturn)>
        | ((...args: TArgs) => TReturn)
  : never;

type OverloadUnion<TOverload extends (...args: any[]) => any> = Exclude<
  _OverloadUnion<
    // The "() => never" signature must be hoisted to the "front" of the
    // intersection, for two reasons: a) because recursion stops when it is
    // encountered, and b) it seems to prevent the collapse of subsequent
    // "compatible" signatures (eg. "() => void" into "(a?: 1) => void"),
    // which gives a direct conversion to a union.
    (() => never) & TOverload
  >,
  TOverload extends () => never ? never : () => never
>;

/*
The tricks to the above recursion are...

a) Inferring the parameter and return types of an overloaded function will use
the last overload signature, which is apparently an explicit design choice.

b) Intersecting a single signature with the original intersection, can reorder
the intersection (possibly an undocumented side effect?).

c) Intersections can only be re-ordered, not narrowed (reduced), So, the
intersection has to be rebuilt in the "TPartialOverload" generic, then
recursion can be stopped when the full intersection has been rebuilt.
Otherwise, this would result in an infinite recursion.
*/

/*
// TESTS
// Eureka!
type TestA1 = OverloadUnion<{
//       ^?
  (): void;
  (a?: 1): 1;
  (a: 2, b: 2): 2;
}>;

// Edge Case: "() => never" signature must be hoisted.
type TestA2 = OverloadUnion<{
//        ^?
  (): void;
  (a?: 1): 1;
  (a: 2, b: 2): 2;
  (): never;
}>;

// Edge Case: Duplicate signatures are omitted.
type TestA3 = OverloadUnion<{
//        ^?
  (): void;
  (a?: 1): 1;
  (): void; // duplicate
  (a: 2, b: 2): 2;
  (a?: 1): 1; // duplicate
}>;
*/

// Note that the order of overloads is maintained in the union, which means
// that it's reversible using a UnionToIntersection type where the overload
// order matters. The exception is "() => never", which has to be hoisted
// to the front of the intersection. However, it's the most specific signature,
// which means hoisting it should be safe if the union is converted back to an
// intersection.

// Inferring a union of parameter tuples or return types is now possible.
type OverloadParameters<T extends (...args: any[]) => any> = Parameters<OverloadUnion<T>>;
type OverloadReturnType<T extends (...args: any[]) => any> = ReturnType<OverloadUnion<T>>;

/*
// TESTS
type TestB1 = OverloadParameters<{
//   ^?
  (): void;
  (a?: 1): 1;
  (a: 2, b: 2): 2;
  (): never;
}>;

type TestB2 = OverloadReturnType<{
//   ^?
  (): void;
  (a?: 1): 1;
  (a: 2, b: 2): 2;
  (): never;
}>;
*/

export { OverloadUnion, OverloadParameters, OverloadReturnType };