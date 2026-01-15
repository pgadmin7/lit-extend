import { css, html } from "lit";
import { useMouse } from "../../composable/useMouse";
import { ExtentedLitElement } from "../../lit-extends";
import { customElement } from "lit/decorators.js";
import { defineComponent, HtmlTemplate, SetupContext } from "../../lit-extends/defineComponent";
import { ref } from "@yiin/reactive-proxy-state";

@customElement("shared-counter")
export class SharedCounterComponent extends ExtentedLitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;
  private _m = this.compose(useMouse);

  connectedCallback() {
    super.connectedCallback();
    console.dir(this);
  }

  render() {
    return html`
      <h1>ref val: ${this._m.someRef}</h1>
      <h2>ref val: ${this._m.someNestedRef.value.dep0}</h2>
      <p>Count: ${this._m.state.count}</p>
      <button @click=${this._onClick}>Count ${this._m.state.x}</button></p>
    `;
  }

  private _onClick() {
    this._m.state.count += 1;
    // this._mouse.count.value += 1;
    // this._mouse.count.value += 1;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "shared-counter": SharedCounterComponent;
  }
}

export const SharedCounterComponentConstructor = defineComponent({
  name: "shared-counter-v2",
  setup(ctx: SetupContext) {
    const { getCurrentInstance, onRender } = ctx;
    const _instance = getCurrentInstance();
    console.log(`Instance:`, _instance);
    const count = ref(0);
    const { state, someNestedRef, someRef } = useMouse(ctx);

    const onClick = () => {
      state.count += 1;
      // someRef.value = `new Val ${state.x}`;
    };

    onRender((): HtmlTemplate => {
      return html`
        <h1>ref val: ${someRef.value}</h1>
        <h2>ref val: ${someNestedRef.value.dep0}</h2>
        <p>Count: ${state.count}</p>
        <p>x: ${state.x}</p>
        <button @click=${onClick}>Count</button></p>
      `;
    });

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
    "shared-counter-v2": typeof SharedCounterComponentConstructor;
  }
}
