import { LitElement, ReactiveElement } from "lit";
import { InternalOptionsSymbol } from "./symbols";
import { Func, Guard, type Fn } from "./../shared";
import { PublicApi } from "./defineComponent/defineComponent";
import { InternalOptions } from "./defineComponent/hooks";

interface DefinedComponentInstance<El extends ReactiveElement> extends LitElement {
  [InternalOptionsSymbol]: InternalOptions<El>;
}
export type MaybeDefinedComponentInstance<T> =  
  T extends ReactiveElement 
    ? DefinedComponentInstance<T> 
    : null;

let currentInstance: MaybeDefinedComponentInstance<ReactiveElement | null> = null;

const setCurrentInstance = <T extends ReactiveElement>(value: T) => {
  const opts = getOptions(value);
  
  if(!(isDefinedComponentInstance(value) && Guard.isNotNullish(opts))) {
    throw new Error("Invalid instance");
  }

  const prev = currentInstance;
  currentInstance = value
  opts.scope.on();

  return (): void => {
    opts.scope.off();
    currentInstance = prev;
  };
};

export const unsetCurrentInstance = (): void => {
  getOptions(currentInstance)?.scope.off();
  currentInstance = null;
};

export type CurrentInstanceType = DefinedComponentInstance<LitElement> & PublicApi;
export const getCurrentInstance = (): null | CurrentInstanceType => {
  if (isDefinedComponentInstance(currentInstance)) {
    return currentInstance as unknown as CurrentInstanceType;
  }
  return null;
};

export const withCurrentInstance = <T extends ReactiveElement, TRet>(value: T, callback: Fn<[], TRet>): TRet => {
  let reset: Func | null = null;
  try {
    reset = setCurrentInstance(value);
    return callback();
  } finally {
    reset?.();
  }
};

export const withCurrentInstanceAsync = async <T extends ReactiveElement, Result>(
  value: T,
  callback: Fn<[], Result>
): Promise<Awaited<Result>> => {
  let reset: Func | null = null;
  try {
    reset = setCurrentInstance(value);
    if (Guard.isAsyncFunction(callback)) {
      return await callback();
    }
    return Promise.resolve(callback());
  } finally {
    reset?.();
  }
};

export const isReactiveElement = (value: unknown): value is ReactiveElement => {
  return (
    typeof value === "object" && 
    value !== null && 
    Object.prototype.isPrototypeOf.call(ReactiveElement.prototype, value)
  );
};

export const isDefinedComponentInstance = (value: unknown)
  : value is DefinedComponentInstance<ReactiveElement> => {
  return (
    Guard.isNotNullish(value) &&
    typeof value === "object" &&
    isReactiveElement(value) &&
    InternalOptionsSymbol in value
  );
};

export const getOptions = (value: unknown) => isDefinedComponentInstance(value) ? value[InternalOptionsSymbol]  : undefined;

export const getCurrentOptions = () => getOptions(getCurrentInstance());
export const getCurrentScope = () => getCurrentOptions()?.scope;
export const getCurrentInstanceId = () => getCurrentOptions()?.uid;