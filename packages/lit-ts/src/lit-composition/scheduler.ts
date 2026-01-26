import { Guard } from "../shared";

export type SchedulerJob = (() => void) & {
  id?: number;
  allowRecurse?: boolean;
};

let isFlushPending = false;
let isFlushing = false;

const queue: SchedulerJob[] = [];
const jobSet = new Set<SchedulerJob>();
const preFlushCbs: SchedulerJob[] = [];
const postFlushCbs: SchedulerJob[] = [];

function queueFlush(): void {
  if (!isFlushPending && !isFlushing) {
    isFlushPending = true;
    queueMicrotask(flushJobs);
  }
}

function flushJobs(): void {
  isFlushPending = false;
  isFlushing = true;

  try {
    // pre-flush
    for (let i = 0; i < preFlushCbs.length; i++) {
      const job = preFlushCbs[i];
      if(Guard.isUndefined(job)) continue;
      job();
    }
    preFlushCbs.length = 0;

    // main jobs
    queue.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

    for (let i = 0; i < queue.length; i++) {
      const job = queue[i];
      if(Guard.isUndefined(job)) continue;
      jobSet.delete(job);
      job();
    }
    queue.length = 0;

    //post-flush (nextTick callbacks)
    for (let i = 0; i < postFlushCbs.length; i++) {
      const job = postFlushCbs[i];
      if (Guard.isUndefined(job)) continue;
      job();
    }
    postFlushCbs.length = 0;
  } catch (err) {
    setTimeout(() => {
      throw err;
    }, 0);
  } finally {
    isFlushing = false;
  }
}

export function queueJob(job: SchedulerJob): void {
  if (!jobSet.has(job)) {
    jobSet.add(job);
    queue.push(job);
    queueFlush();
  }
}

export function queuePreFlushCb(cb: SchedulerJob): void {
  preFlushCbs.push(cb);
  queueFlush();
}

export function queuePostFlushCb(cb: SchedulerJob): void {
  postFlushCbs.push(cb);
  queueFlush();
}