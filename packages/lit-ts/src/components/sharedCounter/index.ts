import { useMouseV2 } from "../../composable/useMouseV2";

import {
  html,
  defineComponent,
  ref,
  computed
} from "../../lit-composition";


export const MyHello = defineComponent({
  name: "my-hello",
  props: {
    who: { type: String },
    excited: { type: Boolean }
  },
  setup() {
    const count = ref(0);
    const deepCount = ref({ someProp: 0 });
    const { coordinate } = useMouseV2.call(this);
    const onClick = () => {
      count.value += 1;
      deepCount.value = { someProp: count.value };
    };

    const computedLabel = computed(() => {
      return `The current button count is ${count.value}`;
    });

    return () => {
      return html`
        <div>
          <p>Mouse Point</p>
          <p>x: ${coordinate.x}</p>
          <p>y: ${coordinate.y}</p>
          <p>deepCount: ${deepCount.value.someProp}</p>
          <p>${computedLabel}</p>
          <button @click=${onClick}>Count</button>
        </div>
      `;
    };
  }
});

declare global {
  interface HTMLElementTagNameMap {
    "my-hello": typeof MyHello;
  }
}
