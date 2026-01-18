import type { LitElement } from "lit";
import { InternalOptionsSymbol } from "./symbols";
import { Guard, type Fn } from "./../shared";
import { PublicApi } from "./defineComponent/defineComponent";

interface DefinedComponentInstance<Options = Record<string, unknown>> extends LitElement {
  [InternalOptionsSymbol]: Options;
}

let currentInstance: unknown = null;

/**
 * Set the current instance of a LitElement, _not_ exported.
 * @param instance the instance to set as current
 */
const setCurrentInstance = <T extends LitElement>(instance: T) => (currentInstance = instance)

/**
 * Get the current instance of a LitElement.
 * There is only one thread of execution, so there is only one current instance at a time.
 */
export const getCurrentInstance = <T extends LitElement>() => currentInstance as T & PublicApi;

/**
 * Execute a callback within the given "current instance" scope
 * @param instance the getCurrentInstance() instance to use
 * @param callback the callback to execute with the current instance
 */
export const withCurrentInstance = <T extends LitElement, Result>(instance: T, callback: Fn<[], Result>): Result => {
  const old = getCurrentInstance<T>()
  try {
    setCurrentInstance(instance)
    return callback()
  } finally {
    setCurrentInstance(old)
  }
}

export const withCurrentInstanceAsync = async <T extends LitElement, Result>(instance: T, callback: Fn<[], Result>): Promise<Result> => {
  const old = getCurrentInstance<T>()
  try {
    setCurrentInstance(instance);
    if(Guard.isAsyncFunction(callback)){
      return await callback();
    }
    return Promise.resolve(callback());
  } finally {
    setCurrentInstance(old)
  }
}

/**
 * Get the options of the current LitElement.
 * These are internal storage for storing hook callbacks.
 */
export const getCurrentOptions = <
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  Options extends {},
  Element extends DefinedComponentInstance<Options> = LitElement & { 
    [InternalOptionsSymbol]: Options;
  },
>(): Options => getCurrentInstance<Element>()?.[InternalOptionsSymbol]