import { html, defineComponent, ref, computed, renderEffect } from "../../lit-composition";
import { useMouse } from "../../composable/useMouse";

export const MyHello = defineComponent({
  name: "my-hello",
  props: {
    who: { type: String },
    excited: { type: Boolean }
  },
  setup() {
    const count = ref(0);
    const deepCount = ref({ someProp: 0 });
    const { coordinate } = useMouse();
    const onClick = () => {
      count.value += 1;
      deepCount.value = { someProp: count.value };
    };

    const computedLabel = computed(() => {
      return `The current button count is ${count.value}`;
    });

    return () => html`
      <div>
        <p>Mouse Point</p>
        ${renderEffect(() => html`<p>x: ${coordinate.x}</p>`)}
        <p>y: ${renderEffect(() => coordinate.y)}</p>
        <p>deepCount: ${renderEffect(() => deepCount.value.someProp)}</p>
        <p>RenderEffect + ComputedRef ${renderEffect(() => computedLabel.value)}</p>
        <p>ComputedEffect: ${computedLabel.value}</p>
        <p>RenderEffect: ${`Count ${count.value}`}</p>
        <button @click=${onClick}>Count</button>
      </div>
    `;
  }
});

declare global {
  interface HTMLElementTagNameMap {
    "my-hello": typeof MyHello;
  }
}
