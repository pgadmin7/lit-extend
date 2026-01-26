import { reactive, onMounted, onUnmounted } from "../lit-composition";

export function useMouse() {
  const coordinate = reactive({ x: 0, y: 0 });

  async function handler(e: MouseEvent) {
    coordinate.x = e.clientX;
    coordinate.y = e.clientY;
  }

  onMounted(() => {
    window.addEventListener("mousemove", handler);
  });

  onUnmounted(() => {
    console.log("unmounted");
    window.removeEventListener("mousemove", handler);
  });

  return { coordinate };
}
