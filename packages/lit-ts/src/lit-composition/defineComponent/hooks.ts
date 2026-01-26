import { LitElement, PropertyDeclaration, type PropertyValues, type ReactiveElement } from "lit";
import { InternalOptionsSymbol } from "../symbols";
import { AbstractConstructor, stubFn, Guard, Assert } from "../../shared";
import { getCurrentOptions, withCurrentInstanceAsync, withCurrentInstance } from "../currentInstance";
import { waitableFlag } from "../utils/waitableFlag";
import { EffectScope } from "../reactivity/effectScope";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createLifecycle<THook extends (...args: any[]) => unknown>() {
  const hooks: THook[] = [];
  return {
    register: (hook: THook) => { hooks.push(hook)  },
    call: <El extends LitElement>(thisArgs: El, ...args: Parameters<THook>) => {
      return Promise.all(
        hooks.map((hook) => {
          return withCurrentInstanceAsync(thisArgs, async () => {
            return hook.apply(thisArgs, args);
          });
        })
      );
    },
    callSync: <El extends LitElement>(thisArgs: El, ...args: Parameters<THook>) => {
      return hooks.map((hook) => withCurrentInstance(thisArgs, () => hook.apply(thisArgs, args)));
    }
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HookInstance<T extends (...args: any[]) => unknown> = ReturnType<typeof createLifecycle<T>>;
type ChangedPropertiesFn<T extends InternalOptions<ReactiveElement>, TRet = void> = (changedProperties: PropertyValues<T>) => TRet;

export type InternalOptions<T extends ReactiveElement> = {
  readonly uid: number;
  scope: EffectScope;
  __readyForRender: ReturnType<typeof waitableFlag>;
  __isMounted: ReturnType<typeof waitableFlag>;
  __isUnmounted: ReturnType<typeof waitableFlag>;
  __isUnmounting: ReturnType<typeof waitableFlag>;
  __isRendering: ReturnType<typeof waitableFlag>;
  render: LitElement["render"];

  // Lit native
  connectedCallback: HookInstance<() => void>;
  disconnectedCallback: HookInstance<() => void>;
  performUpdate: HookInstance<() => void>;
  shouldUpdate: HookInstance<ChangedPropertiesFn<T, boolean>>;
  willUpdate: HookInstance<ChangedPropertiesFn<T>>;
  update: HookInstance<ChangedPropertiesFn<T>>;
  firstUpdated: HookInstance<ChangedPropertiesFn<T>>;
  updated: HookInstance<ChangedPropertiesFn<T>>;

  // Vue3 style
  beforeMount: HookInstance<() => void>;
  mounted: HookInstance<() => void>;
  beforeUpdate: HookInstance<() => void>;
  beforeUnmount: HookInstance<() => void>;
  unmounted: HookInstance<() => void>;
};

let id = 0;
export function withHooks<
  TBase extends AbstractConstructor<LitElement>,
  WithHooksType = abstract new () => LitElement &
    InstanceType<TBase> & {
      __opts: InternalOptions<InstanceType<TBase>>;
      $nextTick(fn?: () => unknown): Promise<boolean>;
    }
>(Base: TBase) {
  abstract class HooksClass extends Base {
    /** @internal */
    [InternalOptionsSymbol]: InternalOptions<this> = {
      uid: id++,
      scope: new EffectScope(),
      __readyForRender: waitableFlag(false),
      __isMounted: waitableFlag(false),
      __isUnmounted: waitableFlag(false),
      __isUnmounting: waitableFlag(false),
      __isRendering: waitableFlag(false),
      render: stubFn,
      connectedCallback: createLifecycle(),
      disconnectedCallback: createLifecycle(),
      willUpdate: createLifecycle<ChangedPropertiesFn<typeof this>>(),
      performUpdate: createLifecycle(),
      shouldUpdate: createLifecycle<ChangedPropertiesFn<typeof this, boolean>>(),
      update: createLifecycle<ChangedPropertiesFn<typeof this>>(),
      firstUpdated: createLifecycle<ChangedPropertiesFn<typeof this>>(),
      updated: createLifecycle<ChangedPropertiesFn<typeof this>>(),
      beforeMount: createLifecycle(),
      mounted: createLifecycle(),
      beforeUpdate: createLifecycle(),
      beforeUnmount: createLifecycle(),
      unmounted: createLifecycle()
    };

    protected get __opts() {
      return this[InternalOptionsSymbol];
    }

    private __connectedCallback = async () => {
      this.__opts.__readyForRender.value = false;
      this.__opts.__isMounted.value = false;
      this.__opts.__isUnmounted.value = false;
      this.__opts.__isUnmounting.value = false;
      await this.__opts.beforeMount.call(this);
      this.__opts.__readyForRender.value = true;
      await this.__opts.connectedCallback.call(this);
      await this.__opts.mounted.call(this);
      this.__opts.__isMounted.value = true;
      return;
    };

    private async __disconnectedCallback() {
      this.__opts.__isUnmounting.value = true;
      await this.__opts.beforeUnmount.call(this);
      await this.__opts.disconnectedCallback.call(this);
      await this.__opts.unmounted.call(this);
      this.__opts.__isMounted.value = false;
      this.__opts.__readyForRender.value = false;
      this.__opts.__isUnmounted.value = true;
      this.__opts.__isUnmounting.value = false;
      return;
    }
    connectedCallback() {
      if(!this.isConnected) return;
      const id = this[InternalOptionsSymbol].uid;
      const scope = this[InternalOptionsSymbol].scope;
      console.log(id, scope);
      console.log()
      super.connectedCallback();
      this.__connectedCallback();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.__disconnectedCallback();
    }

    protected willUpdate(_changedProperties: PropertyValues<this>) {
      super.willUpdate(_changedProperties);
      return this.__opts.willUpdate.callSync(this, _changedProperties);
    }

    protected shouldUpdate(_changedProperties: PropertyValues<this>): boolean {
      if (super.shouldUpdate(_changedProperties) === true) return true;
      const should = this.__opts.shouldUpdate.callSync(this, _changedProperties)?.some((i) => Boolean(i) === true);
      return should ? true : false;
    }

    protected updated(_changedProperties: PropertyValues<this>) {
      super.updated(_changedProperties);
      this.__opts.updated.callSync(this, _changedProperties);
      return;
    }

    protected firstUpdated(_changedProperties: PropertyValues<this>) {
      super.firstUpdated(_changedProperties);
      return this.__opts.firstUpdated.callSync(this, _changedProperties);
    }

    protected performUpdate() {
      this.__opts.__isRendering.value = true;
      super.performUpdate();
      return this.__opts.performUpdate.callSync(this);
    }

    protected override async scheduleUpdate(): Promise<void> {
      if (this.__opts.__readyForRender.value !== true) {
        await this.__opts.__readyForRender.wait();
      }
      if (this.__opts.__isRendering.value === true) {
        // console.log(`waiting to finish render`);
        await this.__opts.__isRendering.wait();
      }
      super.scheduleUpdate();
    }

    protected async getUpdateComplete(): Promise<boolean> {
      const result = await super.getUpdateComplete();
      return result;
    }

    public override requestUpdate(
      name?: PropertyKey,
      oldValue?: unknown,
      options?: PropertyDeclaration,
      useNewValue?: boolean,
      newValue?: unknown
    ): void {
      if (
        Guard.isNotNullish(this.__opts) &&
        this.__opts.__isMounted.value === true &&
        this.__opts.__isUnmounting.value !== true
      ) {
        this.__opts.beforeUpdate
          .call(this)
          .then(() => super.requestUpdate(name, oldValue, options, useNewValue, newValue));
        return;
      }
      return super.requestUpdate(name, oldValue, options, useNewValue, newValue);
    }

    public async $nextTick(fn?: () => unknown): Promise<boolean> {
      // console.log("Triggering requestUpdate");
      this.requestUpdate();
      const resolved = await this.updateComplete;
      if (Guard.isNullish(fn) || (!Guard.isFunction(fn) && !Guard.isAsyncFunction(fn))) return resolved;
      await fn.call(this);
      return resolved;
    }
  }
  return HooksClass as unknown as WithHooksType;
}

function options<T extends InternalOptions<ReactiveElement>>() {
  const options = getCurrentOptions();

  Assert.defined(options)
  return options as T
}

type SomeFunc = (...args: unknown[]) => unknown;
// Lit native hooks
export const onConnected = (cb: SomeFunc) => options().connectedCallback.register(cb);
export const onDisconnected = (cb: SomeFunc) => options().disconnectedCallback.register(cb);
export const onShouldUpdate = <T extends LitElement>(cb: ChangedPropertiesFn<T, boolean>) => options().shouldUpdate.register(cb);
export const onWillUpdate = <T extends LitElement>(cb: ChangedPropertiesFn<T>) => options().willUpdate.register(cb);
export const onPerformUpdate = (cb: SomeFunc) => options().performUpdate.register(cb);
export const onUpdate = <T extends LitElement>(cb: ChangedPropertiesFn<T>) => options().update.register(cb);
export const onFirstUpdated = <T extends LitElement>(cb: ChangedPropertiesFn<T>) => options().firstUpdated.register(cb);
export const onUpdated = <T extends LitElement>(cb: ChangedPropertiesFn<T>) => options().updated.register(cb);

// Vue3 style hooks
export const onBeforeMount = (cb: SomeFunc) => options().beforeMount.register(cb);
export const onBeforeUnmount = (cb: SomeFunc) => options().beforeUnmount.register(cb);
export const onBeforeUpdate = (cb: SomeFunc) => options().beforeUpdate.register(cb);
export const onMounted = (cb: SomeFunc) => options().mounted.register(cb);
export const onUnmounted = (cb: SomeFunc) => options().unmounted.register(cb);
