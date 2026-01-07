import { normalizePath } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const absolutePath = (...paths: string[]) => {
  const cwd = dirname(fileURLToPath(import.meta.url));
  return normalizePath(resolve(cwd, ...paths));
}

export {
  absolutePath
}