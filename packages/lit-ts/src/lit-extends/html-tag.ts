import { html as coreHtml, svg as coreSvg, type TemplateResult } from "lit/html.js";

export const withIsRef =
  (coreTag: typeof coreHtml | typeof coreSvg) =>
    (strings: TemplateStringsArray, ...values: unknown[]): TemplateResult => {
    return coreTag(strings, ...values);
  };

export const html = withIsRef(coreHtml);
export const svg = withIsRef(coreSvg);
