/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, ReactiveControllerHost } from "lit";
import { Constructor } from "../shared";

export type ComposableContext = {
  nextTick: () => Promise<void>;
  onMounted: (hook: () => void) => void;
  onUnmounted: (hook: () => void) => void;
};

export type Composable = (ctx: ComposableContext, ...args: any[]) => any;
export type ComposableArgs<F> = F extends (ctx: ComposableContext, ...args: infer P) => any ? P : never;
export type ComposableRet<F> = F extends (ctx: ComposableContext, ...args: any[]) => infer R ? R : never;

export interface ComposableHost {
  compose<F extends Composable>(composable: F, ...args: ComposableArgs<F>): ComposableRet<F>;
}

class ComposableWrapperController {
  
  static create<F extends Composable>(
    host: ReactiveControllerHost,
    composable: F,
    ...args: ComposableArgs<F>
  ): ComposableRet<F> {
    const context = new ComposableWrapperController(host).ctx;
    return composable(context, ...args);
  }

  private __host: ReactiveControllerHost;
  //lifecycle
  private __mountedHooks: (() => void)[] = [];
  private __unmountedHooks: (() => void)[] = [];

  private constructor(host: ReactiveControllerHost) {
    this.__host = host;
    host.addController(this);
  }

  private __onRegisterMountedHook(hook: () => void) {
    this.__mountedHooks.push(hook);
  }

  private __onRegisterUnmountedHook(hook: () => void) {
    this.__unmountedHooks.push(hook);
  }

  async nextTick() {
    this.__host.requestUpdate();
    await this.__host.updateComplete;
  }

  // Context
  public get ctx(): ComposableContext {
    const ctx: ComposableContext = {
      nextTick: this.nextTick.bind(this),
      onMounted: this.__onRegisterMountedHook.bind(this),
      onUnmounted: this.__onRegisterUnmountedHook.bind(this),
    };
    return ctx;
  }

  hostConnected() {
    this.__mountedHooks.forEach((hooks) => hooks());
  }

  hostDisconnected() {
    this.__unmountedHooks.forEach((hooks) => hooks());
  }
}

const composablesKey = Symbol("composables");
export const ComposableMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class ComposableMixinClass extends superClass implements ComposableHost {
    [composablesKey] = new WeakSet<any>();

    compose<F extends Composable>(composable: F, ...args: ComposableArgs<F>): ComposableRet<F> {
      const result = ComposableWrapperController.create(this, composable, ...args);
      this[composablesKey].add(result);
      return result;
    }
  }
  return ComposableMixinClass as Constructor<ComposableHost> & T;
};
