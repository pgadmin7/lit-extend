import { ReactiveControllerHost } from "lit";

export type CustomEffectScheduler = (job: () => void) => void;
export function useCustomEffectScheduler<T extends ReactiveControllerHost>(host: T) {
  const effectQueue = new Set<() => void>();
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
        console.log("RENDER SCHEDULAR")
        rafScheduled = false;
      });
    }
  };

  const scheduler: CustomEffectScheduler = (job: () => void) => {
    effectQueue.add(job);
    queueMicrotask(flushEffects);
  };
  return scheduler;
}
