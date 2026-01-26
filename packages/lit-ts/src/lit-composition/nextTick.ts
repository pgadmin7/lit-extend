let isFlushing = false;

const resolvedPromise: Promise<void> = Promise.resolve();
const postFlushCbs: Array<() => void> = [];

function flushPostFlushCbs(): void {
  for (let i = 0; i < postFlushCbs.length; i++) {
    try {
      postFlushCbs[i]?.();
    } catch (err) {
      setTimeout(() => {
        throw err;
      }, 0);
    }
  }
  postFlushCbs.length = 0;
}

function queueFlush(): void {
  if (!isFlushing) {
    isFlushing = true;
    queueMicrotask(flush);
  }
}

function flush(): void {
  isFlushing = false;
  flushPostFlushCbs();
}

export function nextTick<T = void>(cb?: () => T | Promise<T>): Promise<T | void> {
  const p = resolvedPromise.then(() => {
    if (cb) return cb();
    return;
  });

  postFlushCbs.push(() => p);

  queueFlush();
  return p;
}
