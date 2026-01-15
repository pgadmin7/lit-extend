export type Option<T> = Some<T> | None;

export interface Some<T> {
  kind: "some";
  value: T;
}

export interface None {
  kind: "none";
}

export const some = <T>(value: T): Option<T> => ({ kind: "some", value });
export const none: Option<never> = { kind: "none" };

// Example usage:
const maybeUser: Option<string> = some("Alice");
const maybeEmpty: Option<string> = none;

// Helper function example:
const unwrapOr = <T>(opt: Option<T>, defaultValue: T): T => (opt.kind === "some" ? opt.value : defaultValue);
