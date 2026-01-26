export abstract class WithActiveInstance {
  private static current?: unknown;

  static hasActiveInstance<T extends typeof WithActiveInstance>(this: T): boolean {
    return this.current !== undefined;
  }

  static setActiveInstance<T extends typeof WithActiveInstance>(this: T, instance: InstanceType<T> | undefined) {
    this.current = instance;
  }

  static getActiveInstance<T extends typeof WithActiveInstance>(this: T): InstanceType<T> | undefined {
    return this.current as InstanceType<T> | undefined;
  }

  static whenActiveInstanceDefined<T extends typeof WithActiveInstance>(
    this: T,
    cb: (current: InstanceType<T>) => unknown
  ): void {
    if (this.current === undefined) return;
    const instance = this.current as InstanceType<T>;
    cb(instance);
  }

  static scopedRun<T extends typeof WithActiveInstance, TRet>(this: T, instance: InstanceType<T>, fn: () => TRet) {
    const temp = this.getActiveInstance();
    try {
      this.setActiveInstance(instance);
      return fn();
    } finally {
      this.setActiveInstance(temp);
    }
  }

  static async scopedRunAsync<T extends typeof WithActiveInstance, TRet>(this: T, instance: InstanceType<T>, fn: () => Promise<TRet>) {
    const temp = this.getActiveInstance();
    try {
      this.setActiveInstance(instance);
      return await fn();
    } finally {
      this.setActiveInstance(temp);
    }
  }
}
