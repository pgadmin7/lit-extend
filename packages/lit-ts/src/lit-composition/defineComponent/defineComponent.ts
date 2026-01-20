import type { CSSResultGroup, PropertyDeclaration } from "lit";
import { LitElement } from "lit";
import {
  ValidatedCustomElementName,
  ValidCustomElementName,
  registerCustomElement
} from "../utils/validCustomElementName";
import { Guard, stubFn } from "../../shared";
import { withHooks } from "./hooks";
import { withCurrentInstance } from "../currentInstance";

export type PublicApi = {
  $nextTick(fn?: () => unknown): Promise<boolean>;
};

export type UnwrapProps<Props extends Record<string, DefinePropertyDeclaration>> = {
  [K in keyof Props]: InferPropType<Props[K]>;
};

type TypeConstructor<T = unknown> = (new (...args: unknown[]) => T & {}) | (() => T) | TypeMethod<T>;
type TypeMethod<T, Ctor = unknown> = [T] extends [((...args: unknown[]) => unknown) | undefined]
  ? { new (): Ctor; (): T; readonly prototype: Ctor }
  : never;

type InferPropType<T, NullAsAny = true> = [T] extends [null]
  ? NullAsAny extends true
    ? unknown
    : null
  : [T] extends [{ type: null | true }]
    ? unknown
    : [T] extends [DefinePropertyDeclaration<unknown, ObjectConstructor>]
      ? Record<string, unknown>
      : [T] extends [DefinePropertyDeclaration<unknown, BooleanConstructor>]
        ? boolean
        : [T] extends [DefinePropertyDeclaration<unknown, DateConstructor>]
          ? Date
          : [T] extends [DefinePropertyDeclaration<unknown, (infer U)[]>]
            ? U extends DateConstructor
              ? Date | InferPropType<U, false>
              : InferPropType<U, false>
            : [T] extends [DefinePropertyDeclaration<unknown, infer V>]
              ? V extends StringConstructor
                ? string
                : V extends NumberConstructor
                  ? number
                  : V extends BooleanConstructor
                    ? boolean
                    : V extends DateConstructor
                      ? Date
                      : V extends PropType<infer P>
                        ? P
                        : V
              : T;

export type PropType<T> = TypeConstructor<T> | (TypeConstructor<T> | null)[];

export interface DefinePropertyDeclaration<Type = unknown, TypeHint = unknown> extends PropertyDeclaration<
  Type,
  TypeHint
> {
  readonly type?: TypeHint;
  readonly default?: TypeHint | (() => TypeHint);
}

const assignDefaultValues = <T extends HTMLElement>(obj: T, props?: Record<string, DefinePropertyDeclaration>) =>
  props &&
  Object.entries(props).forEach(([key, prop]: [unknown, DefinePropertyDeclaration]) => {
    if (Guard.isUndefined(prop.default)) return;
    const value = (Guard.isFunction(prop.default) ? prop.default.call(null) : prop.default) as T[keyof T];
    obj[key as keyof T] ??= value;
  });

export const defineComponentWithOptions = <
  Name extends ValidCustomElementName,
  UseShadowRoot extends boolean,
  Properties extends Record<string, DefinePropertyDeclaration>,
  Styles extends UseShadowRoot extends true | undefined ? CSSResultGroup : never,
  Parent extends typeof LitElement,
  Instance extends InstanceType<Parent> & UnwrapProps<Properties> & PublicApi,
  Render extends (this: Instance) => unknown,
  Setup extends (this: Instance, comp?: Instance) => void | Render
>(
  options: {
    name?: ValidatedCustomElementName<Name>;
    parent?: Parent;
    styles?: Styles;
    props?: Properties;

    register?: boolean;
    shadowRoot?: UseShadowRoot;

    setup?: Setup;
    render?: Render;
  },
  decorator: LitElementDecorator
): typeof LitElement & PublicApi => {
  options = Object.create(options) as typeof options;
  const { name, parent: BaseClass = LitElement, register } = options;
  const SuperClass = withHooks(decorator(BaseClass));

  const result = class extends SuperClass {
    static properties = options.props ?? ({} as Properties);
    static styles = options.styles ?? undefined;

    protected createRenderRoot(): HTMLElement | DocumentFragment {
      return options.shadowRoot === false ? this : super.createRenderRoot();
    }

    constructor() {
      super();
      withCurrentInstance(this, () => {
        assignDefaultValues(this, options.props);
        const setupResult = options.setup?.call(this as unknown as Instance, this as unknown as Instance);

        if (Guard.isFunctionLike(setupResult)) {
          this.__opts.render = setupResult;
          return;
        }
        if (Guard.isNotNullish(options.render)) {
          this.__opts.render = options.render!;
          return;
        }
        if (Guard.isNotNullish(super.render.bind(this))) {
          this.__opts.render = super.render.bind(this);
          return;
        }
        this.__opts.render = stubFn;
      });
    }

    render() {
      return withCurrentInstance(this, () => {
        if (Guard.isNullish(this.__opts.render)) return;

        if (Guard.isAsyncFunction(this.__opts.render)) {
          throw Error("Render function cannot be async!");
        }
        return this.__opts.render.call(this);
      });
    }
  };

  // register the component
  if (register != false && Boolean(name)) {
    registerCustomElement(name as ValidCustomElementName, result);
  }
  return result as unknown as typeof LitElement & PublicApi;
};

export type DefinedComponent = ReturnType<typeof defineComponent> & PublicApi;
export type DefinedComponentInstance = InstanceType<DefinedComponent>;

type LitElementDecorator = (t: typeof LitElement) => typeof t;

export type FunctionComponentOptions = {
  [K in keyof Parameters<typeof defineComponentWithOptions>[0]]: Parameters<typeof defineComponentWithOptions>[0][K];
} & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  styles: any;
};

export const defineFunctionalComponent = <Name extends ValidCustomElementName>(
  name: ValidatedCustomElementName<Name>,
  render: () => unknown,
  opts = {} as FunctionComponentOptions,
  decorator: LitElementDecorator
) => defineComponentWithOptions({ ...opts, name, render, shadowRoot: false }, decorator);

export type SkipLastParam<T extends unknown[]> = T extends [...infer U, unknown] ? U : never;

export function defineComponent(
  name: ValidCustomElementName,
  render: () => unknown,
  opts?: FunctionComponentOptions
): typeof LitElement & PublicApi;

export function defineComponent<
  Name extends ValidCustomElementName,
  UseShadowRoot extends boolean,
  Properties extends Record<string, DefinePropertyDeclaration>,
  Styles extends UseShadowRoot extends true | undefined ? CSSResultGroup | undefined : undefined,
  Parent extends typeof LitElement,
  Instance extends InstanceType<Parent> & UnwrapProps<Properties> & PublicApi,
  Render extends (this: Instance) => unknown,
  Setup extends (this: Instance, comp?: Instance) => void | Render
>(options: {
  name?: ValidatedCustomElementName<Name>;
  parent?: Parent;
  styles?: Styles;
  props?: Properties;
  register?: boolean;
  shadowRoot?: UseShadowRoot;
  setup?: Setup;
  render?: Render;
}): typeof LitElement & PublicApi;

export function defineComponent(
  ...args:
    | [name: ValidCustomElementName, render: () => unknown, opts?: FunctionComponentOptions]
    | SkipLastParam<Parameters<typeof defineComponentWithOptions>>
) {
  return Guard.isString(args[0])
    ? defineFunctionalComponent(args[0], args[1] as () => unknown, args[2], (l) => l)
    : defineComponentWithOptions(args[0], (l) => l);
}
