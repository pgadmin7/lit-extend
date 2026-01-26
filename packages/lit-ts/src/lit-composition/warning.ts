/* eslint-disable @typescript-eslint/no-explicit-any */

function warn(msg: string, ...args: any[]): void;
function warn(condition: boolean, msg: string, ...args: any[]): void;
function warn(conditionOrMsg: boolean | string, msgOrArg?: string, ...args: any[]): void {
  if (typeof conditionOrMsg === "string") {
    console.warn(`[LIB warn] ${conditionOrMsg}`, msgOrArg, ...args);
    return;
  }
  if (conditionOrMsg !== true) return;
  console.warn(`[LIB warn] ${msgOrArg}`, ...args);
}

export { warn };
