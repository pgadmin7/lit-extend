import { LitElement } from "lit";
import { ComposableMixin } from "./composableMixin";
export * from "./html-tag";
export const ExtentedLitElement = ComposableMixin(LitElement);
