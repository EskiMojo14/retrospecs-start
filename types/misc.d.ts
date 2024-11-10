/* eslint-disable @typescript-eslint/no-unused-vars */

declare module "csstype" {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  export interface CSSProperties {
    [key: `--${string}`]: unknown;
  }
}

interface TextInfo {
  direction: "ltr" | "rtl";
}

namespace Intl {
  interface Locale {
    textInfo?: TextInfo;
    getTextInfo?(): TextInfo;
  }
}
