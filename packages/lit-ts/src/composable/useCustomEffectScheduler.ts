import { ReactiveEffectRunner } from "@vue/reactivity";
import { ReactiveControllerHost } from "lit";


export type CustomEffectScheduler = (runner: ReactiveEffectRunner) => void
export function useCustomEffectScheduler<T extends ReactiveControllerHost>(host: T) {
  const effectQueue = new Set<ReactiveEffectRunner>();
  let flushingEffects = false;
  let rafScheduled = false;

  const flushEffects = async () => {
    if (flushingEffects) return;
    flushingEffects = true;

    for (const runner of effectQueue) {
      await runner();
    }
    effectQueue.clear();
    flushingEffects = false;

    if (!rafScheduled) {
      rafScheduled = true;
      requestAnimationFrame(async () => {
        host.requestUpdate();
        await host.updateComplete;
        rafScheduled = false;
      });
    }
  };

  const scheduler: CustomEffectScheduler = (runner: ReactiveEffectRunner) => {
    effectQueue.add(runner);
    queueMicrotask(flushEffects);
  };
  return scheduler;
}
