import { reactive, ref } from "@yiin/reactive-proxy-state";
import { ComposableContext } from "../lit-extends/composableMixin";


export function useMouse({onMounted, onUnmounted } : ComposableContext) {
  const someRef = ref("Hello From Ref");
  const someNestedRef = ref({ dep0: "hellow" });
  const state = reactive({ x: 0, y: 0, count: 0 });

  async function handler(e: MouseEvent) {
    state.x = e.clientX;
    state.y = e.clientY;
  }

  onMounted(() => {
    window.addEventListener("mousemove", handler);
  });

  onUnmounted(() => {
    window.removeEventListener("mousemove", handler);
  });

  return {
    someRef,
    someNestedRef,
    state
  };
}