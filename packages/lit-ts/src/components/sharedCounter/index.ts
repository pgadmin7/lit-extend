import { html } from "lit";
import { useMouse } from "../../composable/useMouse";
import { defineComponentV2, SetupContext } from "../../lit-extends/defineComponent";
import { ref } from "@yiin/reactive-proxy-state";
import {
  defineComponent,
  onBeforeMount,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  onUnmounted
} from "../../lit-composition";
import { delay } from "../../shared";

export const SharedCounterComponent = defineComponentV2({
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

    onRender(
      () => html`
      <h2>Ref Test: ${someRef.value}</h2>
      <h2>Reactive Test: ${someNestedRef.value.dep0}</h2>
      <p>Count: ${state.count}</p>
      <p>x: ${state.x} | y: ${state.y}</p>
      <button @click=${onClick}>Count</button></p>
    `
    );

    return {
      count,
      someRef,
      someNestedRef,
      state,
      onClick
    };
  }
});

export const MyHello = defineComponent({
  name: "my-hello",
  props: {
    who: { type: String },
    excited: { type: Boolean }
  },
  setup() {
    onBeforeMount(async () => {
      console.log(`LifeCycle hook: onBeforeMount ${this.who}`);
      await delay(5000);
    });
    onBeforeUnmount(() => {
      console.log(`LifeCycle hook: onBeforeUnmount ${this.who}`);
    });
    onBeforeUpdate(() => {
      console.log(`LifeCycle hook: onBeforeUpdate ${this.who}`);
    });
    onMounted(async () => {
      console.log(`LifeCycle hook: onMounted ${this.who}`);
    });
    onUnmounted(() => {
      console.log(`LifeCycle hook: onUnmounted ${this.who}`);
    });
    return async () => {
      await this.$nextTick(() => {
        console.log(`Render nextTick: ${this.who}`);
      });
      return html`Hello, ${this.who}${this.excited ? "!" : ""}`;
    };
  },
  loader() {
    return html`Loading...`;
  }
});

declare global {
  interface HTMLElementTagNameMap {
    "shared-counter": typeof SharedCounterComponent;
    "my-hello": typeof MyHello;
  }
}
