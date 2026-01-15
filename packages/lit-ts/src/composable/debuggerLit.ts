import type { LitUnstable } from "lit";

type LitDomRerenderDebugger = {
  detach(): void;
};

export function attachLitDomRerenderDebugger(): LitDomRerenderDebugger {
  // Enable Lit unstable debug events
  (window as any).emitLitDebugLogEvents = true;

  const touchedElements = new Set<Element>();
  let scheduled = false;

  const onDebugEvent = (e: Event) => {
    const entry = (e as CustomEvent<LitUnstable.DebugLog.Entry>).detail;

    switch (entry.kind) {
      case "commit attribute":
      case "commit property":
      case "commit boolean attribute":
      case "commit event listener":
      case "commit to element binding": {
        touchedElements.add(entry.element);
        break;
      }

      case "commit text": {
        const parent = entry.node.parentElement;
        if (parent) touchedElements.add(parent);
        break;
      }

      case "commit node": {
        if (entry.value instanceof Element) {
          touchedElements.add(entry.value);
        }
        break;
      }
    }

    if (!scheduled) {
      scheduled = true;
      queueMicrotask(flush);
    }
  };

  const flush = () => {
    scheduled = false;
    if (touchedElements.size === 0) return;

    console.group("[Lit] DOM re-rendered elements");
    touchedElements.forEach((el) => console.log(el));
    console.groupEnd();

    touchedElements.clear();
  };

  window.addEventListener("lit-debug", onDebugEvent);

  return {
    detach() {
      window.removeEventListener("lit-debug", onDebugEvent);
      touchedElements.clear();
    }
  };
}
