import { TemplateResult } from "lit/html.js";
import { ExtentedLitElement } from "./index";
import { watchEffect, WatchEffectStopHandle } from "@yiin/reactive-proxy-state";
import { Guard } from "../shared";

export type LifeCycleHook = "beforeUpdate" | "updated" | "beforeMounted" | "mount" | "beforeUnmounted" | "unmount";

export type SetupContext = {
  nextTick: () => Promise<void>;
  onBeforeMount: (hook: () => void) => void;
  onBeforeUnmount: (hook: () => void) => void;
  onBeforeUpdate: (hook: () => void) => void;
  onMounted: (hook: () => void) => void;
  onUnmounted: (hook: () => void) => void;
  onUpdated: (hook: () => void) => void;
  getCurrentInstance: () => InstanceType<typeof ExtentedLitElement>;
  onRender: (template: () => TemplateResult) => void;
};
export type SetupFn = (ctx: SetupContext) => unknown;

export type defineComponentParams = {
  name: string;
  setup: SetupFn;
};

export function defineComponentV2({ name, setup }: defineComponentParams) {
  
  const __hooks: Record<LifeCycleHook, Set<() => unknown>> = {
    beforeMounted: new Set<() => unknown>(),
    mount: new Set<() => unknown>(),
    beforeUnmounted: new Set<() => unknown>(),
    unmount: new Set<() => unknown>(),
    beforeUpdate: new Set<() => unknown>(),
    updated: new Set<() => unknown>()
  };

  let __template: () => TemplateResult;
  let __isMounted: boolean = false;
  let __isUnmounted: boolean = false;
  let __isUnmounting: boolean = false;
  let __nextTickHandler: () => Promise<void>;
  let __getCurrentInstance: () => InstanceType<typeof ExtentedLitElement>;

  const __onRegisterLifeCycleHook = (type: LifeCycleHook, cb: () => void) => {
    __hooks[type].add(cb);
  };

  const __execHooks = async (type: LifeCycleHook) => {
    const resolve = async (h: LifeCycleHook) => {
      queueMicrotask(async () => {
        await Promise.all(Array.from(__hooks[h]).map((i) => Promise.wrapAsync(i)()));
      });
    };

    if (type === "beforeUpdate" || type === "updated") {
      if (__isMounted === true && __isUnmounting !== true) {
        await resolve(type);
        return;
      }
      return;
    }

    if (type === "mount" || type === "beforeMounted") {
      if (__isMounted !== true && __isUnmounting !== true) {
        await resolve(type);
        return;
      }
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (type === "unmount" || type === "beforeUnmounted") {
      if (__isUnmounted !== true && __isUnmounting !== true) {
        await resolve(type);
        return;
      }
      return;
    }
  };

  const __nextTickFn = async () => {
    await __execHooks("beforeUpdate");
    await __nextTickHandler!();
    await __execHooks("updated");
  };

  const __connectedCallbackFn = async () => {
    __isMounted = false;
    __isUnmounted = false;
    __isUnmounting = false;
    await __execHooks("beforeMounted");
    await __execHooks("mount");
    __isMounted = true;
    await __nextTickFn();
  };

  const __disconnectedCallback = async () => {
    __isUnmounting = true;
    await __execHooks("beforeUnmounted");
    await __execHooks("unmount");
    __isMounted = false;
    __isUnmounted = true;
    __isUnmounting = false;
  };

  const ctx: SetupContext = {
    nextTick: () => Promise.resolve(__nextTickHandler()),
    onBeforeMount: (cb: () => void) => __onRegisterLifeCycleHook("beforeMounted", cb),
    onBeforeUnmount: (cb: () => void) => __onRegisterLifeCycleHook("beforeUnmounted", cb),
    onBeforeUpdate: (cb: () => void) => __onRegisterLifeCycleHook("beforeUpdate", cb),
    onMounted: (cb: () => void) => __onRegisterLifeCycleHook("mount", cb),
    onUnmounted: (cb: () => void) => __onRegisterLifeCycleHook("unmount", cb),
    onUpdated: (cb: () => void) => __onRegisterLifeCycleHook("updated", cb),
    getCurrentInstance: () => __getCurrentInstance(),
    onRender: (template: () => TemplateResult) => (__template = template)
  };

  const internalComponent = class extends ExtentedLitElement {
    private readonly __data;
    private __unwatch?: WatchEffectStopHandle;
    data() {
      return this.__data;
    }

    constructor() {
      super();
      __nextTickHandler = () => this.nextTick();
      __getCurrentInstance = () => this;
      this.attachShadow({ mode: "open" });
      const data = setup(ctx);

      this.__data = {};
      if (data == null) {
        return;
      }
      if (Guard.isArray(data)) {
        return;
      }
      if (Guard.isFunction(data)) {
        return;
      }
      if (Guard.isObject(data)) {
        this.__data = data;
      }
    }

    connectedCallback() {
      super.connectedCallback();
      this.__unwatch?.();
      this.__unwatch = undefined;
      this.__unwatch = watchEffect((onCleanup) => {
        void __template().values;
        onCleanup(async () => this.requestUpdate());
      });
      __connectedCallbackFn();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.__unwatch?.();
      this.__unwatch = undefined;
      __disconnectedCallback();
    }

    async nextTick() {
      this.requestUpdate();
      await this.updateComplete;
    }

    render() {
      return __template();
    }
  };

  if (!customElements.get(name)) {
    customElements.define(name, internalComponent);
  }

  return internalComponent as typeof ExtentedLitElement;
};
