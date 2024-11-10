import type { SVGProps } from "react";
const SvgDeclineInvite = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    style={{
      fillRule: "evenodd",
      clipRule: "evenodd",
      strokeLinejoin: "round",
      strokeMiterlimit: 2,
    }}
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="currentColor"
    {...props}
  >
    <path d="M13.342 20H2V4h20v8.804a6 6 0 0 0-2-.721V8l-8 5-8-5v10h9c0 .701.121 1.374.342 2M4 6l8 5 8-5zm12.9 15.5-1.4-1.4 2.1-2.1-2.1-2.1 1.4-1.4 2.1 2.1 2.1-2.1 1.4 1.4-2.075 2.1 2.075 2.1-1.4 1.4-2.1-2.075z" />
  </svg>
);
export default SvgDeclineInvite;
