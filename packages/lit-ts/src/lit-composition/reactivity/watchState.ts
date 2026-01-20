import { ReactiveElement } from 'lit';
import { html as coreHtml, svg as coreSvg, type TemplateResult } from "lit/html.js";
import { isTemplateResult } from "lit/directive-helpers.js";
import { AsyncDirective, directive, Part } from "lit/async-directive.js";
import { watchEffect, ComputedRef, WritableComputedRef, isComputed } from "../reactivity";
import { Guard } from "../../shared";

/**
 * A Lit AsyncDirective that watches reactive values (primitives, objects, computed or TemplateResult)
 * and updates only when the value actually changes.
 *
 * Works with:
 * - primitives (number, string, boolean)
 * - reactive objects and computed (reactive-proxy-state)
 * - TemplateResult (html``)
 *
 * Usage:
 *
 * const computedDouble = computed(() => count.value * 2);
 *
 * html`<p>${watchState(() => ${someValue})}</p>`
 * html`<p>${watchState(() => html`${someValue}`)}</p>`
 * html`<p>${watchState(() => ${computedDouble} </p>
 */

type MaybeGetterOrComputed<T> = (() => T) | ComputedRef<T> | WritableComputedRef<T>;
class WatchStateDirective<T> extends AsyncDirective {
  private cleanupEffect?: () => void;
  private cleanupGetterEffect?: () => void;
  private getterOrComputed?: MaybeGetterOrComputed<T>;
  private lastValue?: T;

  render(getterOrComputed: MaybeGetterOrComputed<T>): T {
    const value = this.readValue(getterOrComputed);
    this.lastValue = value;
    return value;
  }

  override update(_part: Part, [getterOrComputed]: [MaybeGetterOrComputed<T>]): T {
    if (this.getterOrComputed !== getterOrComputed) {
      this.cleanup();
      this.getterOrComputed = getterOrComputed;
      this.setupWatch();
    }
    return this.readValue(getterOrComputed);
  }

  private readValue(getterOrComputed: MaybeGetterOrComputed<T>): T {
    if (isComputed<T>(getterOrComputed)) return getterOrComputed.value;
    return (getterOrComputed as () => T)();
  }

  private setupWatch() {
    if (!Guard.isFunction(this.getterOrComputed) && !isComputed(this.getterOrComputed)) return;

    // Watch either computed or reactive getter
    const stop = watchEffect(() => {
      const value = this.readValue(this.getterOrComputed!);
      if (!this.shouldUpdate(value, this.lastValue)) return;
      this.setValue(value);
      this.lastValue = value;
    });

    if (isComputed(this.getterOrComputed)) {
      this.cleanupGetterEffect = this.getterOrComputed.stop;
    }
    this.cleanupEffect = stop;
  }

  private shouldUpdate(newVal: T, oldVal?: T) {
    if (newVal === oldVal) return false;

    if (isTemplateResult(newVal) && isTemplateResult(oldVal)) {
      const newTpl = newVal as TemplateResult & { values: unknown[] };
      const oldTpl = oldVal as TemplateResult & { values: unknown[] };

      if (newTpl.strings === oldTpl.strings) {
        if (newTpl.values.length === oldTpl.values.length) {
          const allEqual = newTpl.values.every((v, i) => v === oldTpl.values[i]);
          if (allEqual) return false;
        }
      }
    }

    return true;
  }

  private cleanup() {
    if (this.cleanupEffect) {
      this.cleanupEffect();
      this.cleanupEffect = undefined;
    }

    if (this.cleanupGetterEffect) {
      this.cleanupGetterEffect();
      this.cleanupGetterEffect = undefined;
    }
  }

  override disconnected() {
    this.cleanup();
  }

  override reconnected() {
    this.setupWatch();
  }
}



export const watchState = directive(WatchStateDirective);

const withWatchState = (coreTag: typeof coreHtml | typeof coreSvg) =>
  function (strings: TemplateStringsArray, ...values: unknown[]): TemplateResult {;
    return coreTag(
      strings,
      ...values.map((v) => {
        console.log(v, strings);

        watchState(() => v);
      })
    );
  };
export const html = withWatchState(coreHtml);
export const svg = withWatchState(coreSvg);
