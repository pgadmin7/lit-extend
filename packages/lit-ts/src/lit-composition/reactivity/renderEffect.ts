/* eslint-disable @typescript-eslint/no-explicit-any */
import { Guard } from "../../shared";
import { WatchEffectStopHandle, Ref, isRefSymbol, TrackedEffect } from "../index";
import { renderAsync, RenderEffectDirective } from "./renderEffectDirective";
import { DirectiveResult } from "lit/async-directive.js";

// symbol for identifying renderEffects
const isRenderEffectSymbol = Symbol("isRenderEffect");

// resembles a ref but is read-only and derived from a getter
export interface RenderEffect<T = any> extends Omit<Ref<T>, "value"> {
  readonly value: T;
  readonly stop: () => void;
  readonly renderer: DirectiveResult<typeof RenderEffectDirective>;
  readonly [Symbol.toStringTag]: "RenderEffect";
  readonly [isRenderEffectSymbol]: true;
  readonly [isRefSymbol]: true; // mark as ref-like for type checks
}

type Getter<T> = () => T;

/**
 * Creates a RenderEffect from a getter function
 *
 * @param getter - The getter function
 * @returns A renderEffect
 */
export function renderEffect<T>(getter: Getter<T>): DirectiveResult<typeof RenderEffectDirective<T>> {
  return useRenderEffect({ getter }).renderer;
}

export const isRenderEffect = <T>(obj: unknown): obj is RenderEffect<T> => {
  return Guard.isNotNullish(obj) && typeof obj === "object" && isRenderEffectSymbol in obj;
};

export type RenderEffectContext<T> = {
  getter: Getter<T>;
  value: T;
  _dirty: boolean;
  _rendering: boolean;
  _effect: TrackedEffect<T> | null;
  _stopEffect: WatchEffectStopHandle<T> | null;
  _renderEffect: RenderEffect<T>
};

function useRenderEffect<T>(
  opts: {getter: Getter<T>}) {
  const build = () => {
    const ctx: RenderEffectContext<T> = {
      getter: opts.getter,
      value: null as T,
      _dirty: true,
      _rendering: false,
      _effect: null as TrackedEffect<T> | null,
      _stopEffect: null as WatchEffectStopHandle<T> | null,
      _renderEffect: {} as RenderEffect<T>
    };
    const directive = renderAsync(ctx);
    const renderEffect: RenderEffect = {
      [Symbol.toStringTag]: "RenderEffect",
      [isRefSymbol]: true,
      [isRenderEffectSymbol]: true,
      stop: () => { ctx._stopEffect?.() },
      get value(): T { return ctx.value; },
      get renderer() { return directive; }
    };
    ctx._renderEffect = renderEffect;
    return renderEffect;
  };
  return build();
}
