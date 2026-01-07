/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, ReactiveControllerHost } from "lit";
import { CustomEffectScheduler, useCustomEffectScheduler } from "../composable/useCustomEffectScheduler";
import { Constructor } from "../utils";
import {
  effect,
  effectScope,
  ref,
  shallowRef,
  reactive,
  shallowReactive,
  EffectScope,
  // ReactiveEffectOptions,
  isRef,
  isShallow,
  isReactive,
  toValue,
} from "@vue/reactivity";

// const debugEffect = (name: string): ReactiveEffectOptions => ({
//   onTrack(e) {
//     console.log(`%c[${name}] track →`, "color: #42b883", e.key);
//   },
//   onTrigger(e) {
//     console.log(`%c[${name}] trigger →`, "color: #e53935", e.key, e.newValue);
//   }
// });

export type ComposableContext = {
  nextTick: () => Promise<void>;
  onMounted: (hook: () => void) => void;
  onUnmounted: (hook: () => void) => void;
  ref: typeof ref;
  shallowRef: typeof shallowRef;
  reactive: typeof reactive;
  shallowReactive: typeof shallowReactive;
  isRef: typeof isRef;
  isReactive: typeof isReactive;
  isShallow: typeof isShallow;
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
  private __scope?: EffectScope = effectScope();
  private __deps = new Set<object>();
  //lifecycle
  private __mountedHooks: (() => void)[] = [];
  private __unmountedHooks: (() => void)[] = [];
  private __schedular: CustomEffectScheduler;

  private __makeRef = (value?: unknown) => {
    const obj = ref(value);
    this.__track(obj);
    return obj;
  };

  private __makeShallowRef = (value?: unknown) => {
    const obj = shallowRef(value);
    this.__track(obj);
    return obj;
  };

  private __makeReactive = <T extends object>(target: T) => {
    const obj = reactive(target);
    this.__track(obj);
    return obj;
  };

  private __makeShallowReactive = <T extends object>(target: T) => {
    const obj = shallowReactive(target);
    this.__track(obj);
    return obj;
  };

  private constructor(host: ReactiveControllerHost) {
    this.__host = host;
    this.__host
    this.__schedular = useCustomEffectScheduler(host);
    host.addController(this);
  }

  private __onRegisterMountedHook(hook: () => void) {
    this.__mountedHooks.push(hook);
  }

  private __onRegisterUnmountedHook(hook: () => void) {
    this.__unmountedHooks.push(hook);
  }

  private __track<T extends object>(source: T): T {
    if (this.__scope == null) throw Error("impossible!!!");
    if (this.__deps.has(source)) return source;

    this.__deps.add(source);
    //  Add more as you go.
    //  https://github.com/vuejs/core/blob/aac7e1898907445c8f89b22047a9bfcf0a6e91b8/packages/reactivity/__tests__/effectScope.spec.ts#L136
    this.__scope.run(() => {
      const runner = effect(
        () => void toValue(source),
        {
          scheduler: () => this.__schedular(runner),
          // ...debugEffect("DEBUGGER")
        }
      );
    });
    console.log(this.__scope);
    return source;
  }

  async nextTick() {
    this.__host.requestUpdate();
    await this.__host.updateComplete;
  }

  // Lit lifecycle hooks
  hostConnected() {
    if (this.__scope == null) {
      this.__scope = effectScope();
    }
    this.__mountedHooks.forEach((i) => i());
  }

  hostDisconnected() {
    this.__scope?.stop();
    this.__unmountedHooks.forEach((i) => i());
  }

  // Context
  public get ctx(): ComposableContext {
    const ctx: ComposableContext = {
      nextTick: this.nextTick.bind(this),
      onMounted: this.__onRegisterMountedHook.bind(this),
      onUnmounted: this.__onRegisterUnmountedHook.bind(this),
      ref: this.__makeRef.bind(this),
      shallowRef: this.__makeShallowRef.bind(this),
      reactive: this.__makeReactive.bind(this),
      shallowReactive: this.__makeShallowReactive.bind(this),
      isRef,
      isReactive,
      isShallow
    };
    return ctx;
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
