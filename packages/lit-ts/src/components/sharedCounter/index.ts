import { html } from "lit";
import { useMouse } from "../../composable/useMouse";
import { defineComponent, SetupContext } from "../../lit-extends/defineComponent";
import { ref } from "@yiin/reactive-proxy-state";

export const SharedCounterComponent= defineComponent({
  name: "shared-counter",
  setup(ctx: SetupContext) {
    const { onRender } = ctx;
    const count = ref(0);
    const { state, someNestedRef, someRef } = useMouse(ctx);

    const onClick = () => {
      state.count += 1;
      someRef.value = `${state.count}`;
      someNestedRef.value.dep0 = `${state.count}`;
    };

    onRender(() => html`
      <h2>Ref Test: ${someRef.value}</h2>
      <h2>Reactive Test: ${someNestedRef.value.dep0}</h2>
      <p>Count: ${state.count}</p>
      <p>x: ${state.x} | y: ${state.y}</p>
      <button @click=${onClick}>Count</button></p>
    `);

    return {
      count,
      someRef,
      someNestedRef,
      state,
      onClick
    };
  }
});

declare global {
  interface HTMLElementTagNameMap {
    "shared-counter": typeof SharedCounterComponent;
  }
}
