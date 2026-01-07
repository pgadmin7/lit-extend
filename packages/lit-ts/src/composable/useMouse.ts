import { ComposableContext } from "src/lit-extends/composableMixin";


export function useMouse({ ref, onMounted, onUnmounted }: ComposableContext) {
  const coordinate = ref({x: 0, y: 0});

  async function handler(e: MouseEvent) {
    coordinate.value = { x: e.clientX, y:  e.clientY };
  }

  onMounted(() => {
    window.addEventListener("mousemove", handler);
  });

  onUnmounted(() => {
    window.removeEventListener("mousemove", handler);
  });

  return { coordinate };
}