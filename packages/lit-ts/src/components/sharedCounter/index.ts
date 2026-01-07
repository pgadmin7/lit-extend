import { css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { useMouse } from "../../composable/useMouse";
import { ExtentedLitElement } from "../../lit-extends";

@customElement("shared-counter")
export class SharedCounterComponent extends ExtentedLitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  count = 0;
  getCount = 10;
  connectedCallback() {
    super.connectedCallback();
  }

  render() {
    const mouse = this.compose(useMouse);

    return html`
      <p>The count is ${this.getCount}</p>
      <p>X: ${mouse.coordinate.value.x}</p>
      <p>Y: ${mouse.coordinate.value.y}</p>
      <button @click=${this._onClick}>Count is ${this.count}</button>
    `;
  }

  private _onClick() {
    this.count += 1;
  }
}

export default SharedCounterComponent;

declare global {
  interface HTMLElementTagNameMap {
    "shared-counter": SharedCounterComponent;
  }
}
