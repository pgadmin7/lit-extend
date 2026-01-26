/* eslint-disable @typescript-eslint/no-explicit-any */
import { noChange, TemplateResult } from "lit";
import { AsyncDirective, directive, DirectiveResult, Part } from "lit/async-directive.js";
import { isTemplateResult } from "lit/directive-helpers.js";
import { RenderEffectContext, watchEffect, WatchEffectStopHandle } from "../reactivity";
import { Guard } from "../../shared";
import { queuePostFlushCb, queuePreFlushCb } from "../scheduler";

const __hasChanged = (newVal?: any, oldVal?: any) => {
  if (newVal === oldVal) return false;
  const isTemplate = isTemplateResult(newVal) && isTemplateResult(oldVal);
  if (!isTemplate) return true;

  const newTpl = newVal as TemplateResult & { values: unknown[] };
  const oldTpl = oldVal as TemplateResult & { values: unknown[] };

  if (newTpl.strings !== oldTpl.strings) return true;
  if (newTpl.values.length !== oldTpl.values.length) return;

  const allEqual = newTpl.values.every((v, i) => v === oldTpl.values[i]);
  if (allEqual) return false;

  return true;
};

export class RenderEffectDirective<T> extends AsyncDirective {
  ctx: RenderEffectContext<T> | null = null;

  cleanup() {
    this.ctx?._stopEffect?.();
  }

  private createWatchEffect() {
    const stopEffect: WatchEffectStopHandle = watchEffect(
      () => this.onChange.apply(this),
      {
        lazy: true,
        scheduler: () => this.job.apply(this),
        // onTrack: (({ effect, target, key, type }) => {
        //   console.log(`[${type}]: ${key.toString()}`, target)
        // }),
        // onTrigger: (({ effect, target, key, type }) => {
        //   console.log(`[${type}]: ${key.toString()}`, target)
        // })
      }
    );

    return {
      effect: stopEffect.effect,
      stopEffect: stopEffect,
    };
  };

  private async onChange() {
    if (Guard.isNullish(this.ctx)) { return; }
    const oldValue = this.ctx.value;
    const newValue = this.ctx.getter();

    const _dirty = __hasChanged(newValue, oldValue);
    if (_dirty !== true) {
      this.ctx._dirty = false;
      return noChange;
    }
    //update ctx. mark as dirty for renderer and set the newVal
    this.ctx._dirty = true;
    this.ctx.value = newValue;
    return newValue;
  };

  private async job() {
    queuePreFlushCb(() => {
      if (Guard.isNullish(this.ctx)) { return; }
      if (!this.ctx._dirty) return;
      if(this.ctx._effect?.run() === noChange) return;
      this.ctx._rendering = true;
      this.setValue(Reflect.get(this.ctx, "value"));
      queuePostFlushCb(() => {
        if (Guard.isNullish(this.ctx)) { return; }
        this.ctx._rendering = false;
      });
    })
  };

  private init(): void {
    if (!this.isConnected) return;
    if (Guard.isNullish(this.ctx)) return;
    this.cleanup();
    const { effect, stopEffect } = this.createWatchEffect();
    this.ctx._effect = effect;
    this.ctx._stopEffect = stopEffect;
  }

  render(_ctx: RenderEffectContext<T>) {
    if (!this.isConnected) { return noChange; }
    this.ctx?._effect?.run();
    return noChange; 
  }

  override update(_part: Part, [ctx]: [RenderEffectContext<T>]) {
    if (this.ctx == null) {
      this.ctx = ctx;
      this.init();
    } else if (this.ctx !== ctx) {
      this.cleanup();
      this.ctx = ctx;
      this.init();
    }
    this.job();
  }

  override disconnected() {
    this.cleanup();
  }

  override reconnected() {
    this.init();
  }
}

export type RenderEffectAsyncDirectiveFunction = <T>(ctx: RenderEffectContext<T>) => DirectiveResult<typeof RenderEffectDirective>;
export const renderAsync = directive(RenderEffectDirective) as RenderEffectAsyncDirectiveFunction;

