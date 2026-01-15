// /* eslint-disable @typescript-eslint/no-explicit-any */

// import type { Observable } from "ol";
// import { unByKey } from "ol/Observable";
// import { EventsKey } from "ol/events";

// import { MaybeRefOrGetter, toValue } from "@vue/reactivity";
// import { OverloadParameters, IsArray, IsNotArray, Prettify, GetPropType } from "../utils";
// import { ComposableContext } from "../lit-extends/composableMixin";

// export const defineHandlers = <T extends Observable>(handlers: HandlerMap<T>) => handlers;

// type OnlySingleType<TIn> = TIn extends [type: infer T, listener: infer L]
//   ? IsArray<T> extends never
//     ? [T, L]
//     : never
//   : never;

// type ToRecord<T extends [any, any]> = { [K in T as K[0]]: K[1] };

// type EventMap<T extends Observable> = OverloadParameters<GetPropType<T, "on">>;
// export type EventType<T extends Observable> = IsNotArray<EventMap<T>[0]>;
// export type HandlerMap<T extends Observable> = Prettify<Partial<ToRecord<OnlySingleType<EventMap<T>>>>>;

// // Build handler map
// export function useOlListener<T extends Observable>(
//   { onMounted, onUnmounted }: ComposableContext,
//   target: MaybeRefOrGetter<T | null>,
//   handlers: HandlerMap<T>
// ) {
//   const eventKeys: EventsKey[] = [];

//   onMounted(() => {
//     const targetObj = toValue(target);
//     if (!targetObj) return;

//     Object.entries(handlers).forEach(([eventType, handler]) => {
//       if (handler != null && typeof handler === "function") {
//         const key = targetObj.on(eventType as any, handler as any);
//         eventKeys.push(key);
//       }
//     });
//   });

//   onUnmounted(() => {
//     eventKeys.forEach((key) => unByKey(key));
//     eventKeys.length = 0;
//   });
// }
