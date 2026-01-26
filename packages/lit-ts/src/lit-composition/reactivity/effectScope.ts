import { Guard, wrapArray } from "../../shared";
import { WithActiveInstance } from "../utils/activatable";
import { warn } from "../warning";
import { watchEffect, WatchEffectOptions, WatchEffectStopHandle } from "../reactivity";

export const getCurrentScope = (): EffectScope | undefined => EffectScope.getActiveInstance();
export const onScopeDispose = (fn: () => void, failSilently = false): void => {
  const activeEffectScope = getCurrentScope();
  if (Guard.isNotNullish(activeEffectScope)) {
    activeEffectScope.cleanups.push(fn);
    return;
  }
  warn(!failSilently, `onScopeDispose() is called when there is no active effect scope` + ` to be associated with.`);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EffectCallbackFn<T = any> = (onCleanup: (cleanupFn: () => void) => void) => T;

export class EffectScope extends WithActiveInstance {
  private _active = true;
  private index: number | undefined;

  readonly detached;
  effects: WatchEffectStopHandle[] = [];
  cleanups: (() => void)[] = [];
  parent: EffectScope | undefined;
  scopes: EffectScope[] | undefined;

  constructor(detached: boolean = false, parent: EffectScope | undefined = EffectScope.getActiveInstance()) {
    super();
    this.detached = detached;
    this.parent = parent;
    if (detached || Guard.isNullish(parent)) return;
    parent.scopes = wrapArray(parent.scopes);
    this.index = parent.scopes.push(this) - 1;
  }

  get active(): boolean {
    return this._active;
  }

  run<T>(effectCallback: EffectCallbackFn<T>): T | undefined {
    if (this._active) {
      const options: WatchEffectOptions = { lazy: true };
      return EffectScope.scopedRun(this, () => {
        const effectHandler: WatchEffectStopHandle<T> = watchEffect(effectCallback, options);
        const effect = effectHandler.effect;
        this.effects.push(effectHandler);

        try {
            return effect.run();
        }
        catch(err) {
            effectHandler();
            throw err;
        }
      });
    }
    warn(`cannot run an inactive effect scope.`);
    return undefined;
  }

  prevScope: EffectScope | undefined;
  on(): void {
    if (this.detached === true) {
      warn("NOOP result function only applicable for non-detached scopes");
      return;
    }
    this.prevScope = EffectScope.getActiveInstance();
    EffectScope.setActiveInstance(this);
  }

  off(): void {
    if (this.detached === true) {
      warn("NOOP result function only applicable for non-detached scopes");
      return;
    }
    EffectScope.setActiveInstance(this.prevScope);
  }

  stop(fromParent?: boolean): void {
    if (this._active) {
      this._active = false;
      let i, l;
      for (i = 0, l = this.effects.length; i < l; i++) {
        this.effects[i]?.(); // runs the stop function
      }
      this.effects.length = 0;

      for (i = 0, l = this.cleanups.length; i < l; i++) {
        this.cleanups[i]?.();
      }
      this.cleanups.length = 0;

      if (this.scopes) {
        for (i = 0, l = this.scopes.length; i < l; i++) {
          this.scopes[i]?.stop(true);
        }
        this.scopes.length = 0;
      }

      // nested scope, dereference from parent to avoid memory leaks
      if (
        !this.detached &&
        fromParent !== true &&
        Guard.isNotNullish(this.parent) &&
        Guard.isArray(this.parent.scopes) &&
        Guard.isNotNullish(this.index)
      ) {
        // optimized O(1) removal
        const last = this.parent.scopes.pop();
        if (last && last !== this) {
          this.parent.scopes[this.index] = last;
          last.index = this.index;
        }
      }
      this.parent = undefined;
    }
  }
}

