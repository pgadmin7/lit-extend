export function waitableFlag(initial = false) {
  let value = initial;

  let resolve!: () => void;
  const promise = new Promise<void>((r) => (resolve = r));

  if (value) resolve();

  return {
    get value() {
      return value;
    },

    set value(v: boolean) {
      value = v;
      if (v) resolve();
    },

    wait(): Promise<void> {
      return value ? Promise.resolve() : promise;
    }
  };
}
