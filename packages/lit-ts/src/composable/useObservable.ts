/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { NOOP } from "../shared/is";
import { Func } from "../shared";

export type Result<T, TError = unknown> =
    | OkResult<T>
    | ErrorResult<TError>;

export type OkResult<T> = {
    type: "OK";
    value: T;
};

export type ErrorResult<TError = unknown> = {
    type: "ERROR";
    error: TError;
};

type Observer<TFunc extends Func> = {
    fn: TFunc;
    once: boolean;
    priority: number;
};

/**
 * Creates a powerful observable with support for:
 * - synchronous and asynchronous notification
 * - pull-based iteration (`iterate`)
 * - eager emit (`emit`, `collect`, `asyncEmit`)
 * - observer priorities
 * - once-only observers
 * - cooperative cancellation via AbortSignal
 * - optional DOM EventTarget compatibility
 */
export function useObservable<TFunc extends Func>() {
    const observers = new Set<Observer<TFunc>>();

    /**
     * Subscribe a function to the observable.
     * @param fn - Observer function
     * @param options.once - If true, observer is removed after first execution
     * @param options.priority - Higher numbers execute earlier
     * @returns Unsubscribe function
     */
    function subscribe(
        fn: TFunc,
        options?: {
            once?: boolean;
            priority?: number;
        }
    ) {
        const observer: Observer<TFunc> = {
            fn,
            once: options?.once ?? false,
            priority: options?.priority ?? 0,
        };

        observers.add(observer);
        return function unsubscribe() {
            observers.delete(observer);
        };
    }

    function extractSignal(args: unknown[]): AbortSignal | undefined {
        const last = args[args.length - 1];
        return last instanceof AbortSignal ? last : undefined;
    }

    function snapshot(): Observer<TFunc>[] {
        return [...observers].sort(function (a, b) {
            return b.priority - a.priority;
        });
    }

    /**
     * Pull-based notification generator.
     * Iterating executes observers one by one.
     * Supports cooperative cancellation via optional AbortSignal.
     *
     * @param args - Arguments to pass to observers
     * @param args[args.length - 1] - Optional AbortSignal
     */
    function* iterate(
        ...args: [...Parameters<TFunc>, AbortSignal?]
    ): Generator<Result<ReturnType<TFunc>>> {
        const signal = extractSignal(args);
        const callArgs = (signal ? args.slice(0, -1) : args) as Parameters<TFunc>;

        for (const observer of snapshot()) {
            if (signal?.aborted) return;

            try {
                yield {
                    type: "OK",
                    value: observer.fn(...callArgs),
                };
            } catch (error) {
                yield {
                    type: "ERROR",
                    error,
                };
            } finally {
                if (observer.once) observers.delete(observer);
            }
        }
    }

    /**
     * Eager notification. Executes all observers and ignores results.
     *
     * @param args - Arguments to pass to observers
     * @param args[args.length - 1] - Optional AbortSignal
     */
    function emit(...args: [...Parameters<TFunc>, AbortSignal?]): void {
        for (const _ of iterate(...args)) { NOOP() }
    }

    /**
     * Eager notification. Executes all observers and returns all results.
     *
     * @param args - Arguments to pass to observers
     * @param args[args.length - 1] - Optional AbortSignal
     * @returns Array of Result objects for each observer
     */
    function collect(...args: [...Parameters<TFunc>, AbortSignal?]): Result<ReturnType<TFunc>>[] {
        const results: Result<ReturnType<TFunc>>[] = [];
        for (const r of iterate(...args)) {
            results.push(r);
        }
        return results;
    }

    /**
     * Eager asynchronous notification. Executes all observers in parallel.
     * Supports cooperative cancellation via optional AbortSignal.
     *
     * @param args - Arguments to pass to observers
     * @param args[args.length - 1] - Optional AbortSignal
     * @returns Promise resolving to array of Result objects for each observer
     */
    async function asyncEmit(...args: [...Parameters<TFunc>, AbortSignal?]): Promise<Result<Awaited<ReturnType<TFunc>>>[]> {
        const signal = extractSignal(args);
        const callArgs = (signal ? args.slice(0, -1) : args) as Parameters<TFunc>;

        if (signal?.aborted) return [];

        const tasks = snapshot().map(async function (observer) {
            try {
                if (signal?.aborted) {
                    throw new DOMException("Aborted", "AbortError");
                }
                const value = await observer.fn(...callArgs);
                return { type: "OK", value } as const;
            } catch (error) {
                return { type: "ERROR", error } as const;
            } finally {
                if (observer.once) observers.delete(observer);
            }
        });

        return Promise.all(tasks);
    }

    const listenerMap = new WeakMap<EventListenerOrEventListenerObject, TFunc>();
    /**
     * Provides a lightweight EventTarget interface for DOM-style usage.
     * Supports addEventListener / removeEventListener / dispatchEvent.
     */
    const eventTarget: EventTarget = {
        addEventListener(_type, listener, options) {
            if (!listener) return;

            const fn = function (event: Event) {
                if (typeof listener === "function"){
                    listener(event);
                    return;
                }
                listener.handleEvent(event);
            };

            listenerMap.set(listener, fn as unknown as TFunc);
            subscribe(fn as unknown as TFunc, {
                once: typeof options === "object" && options.once,
            });
        },

        removeEventListener(_type, listener) {
            if (!listener) return;

            const fn = listenerMap.get(listener);
            if (!fn) return;

            for (const observer of observers) {
                if (observer.fn === fn) observers.delete(observer);
            }

            listenerMap.delete(listener);
        },

        dispatchEvent(event: Event) {
            const args = [event] as Parameters<TFunc>;
            emit(...args, undefined);
            return !event.defaultPrevented;
        }
    };

    return {
        subscribe,
        iterate,
        emit,
        collect,
        asyncEmit,
        eventTarget,
    };
}
