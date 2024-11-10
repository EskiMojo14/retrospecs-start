import type { SVGProps } from "react";
const SvgCassetteSpokes = (props: SVGProps<SVGSVGElement>) => (
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
    <path d="M12 0c6.623 0 12 5.377 12 12s-5.377 12-12 12S0 18.623 0 12 5.377 0 12 0m0 3c-4.967 0-9 4.033-9 9s4.033 9 9 9 9-4.033 9-9-4.033-9-9-9" />
    <path d="M12 2c5.519 0 10 4.481 10 10s-4.481 10-10 10S2 17.519 2 12 6.481 2 12 2m0 2c-4.415 0-8 3.585-8 8s3.585 8 8 8 8-3.585 8-8-3.585-8-8-8" />
    <path d="M11 3h2v5h-2zM11 16h2v5h-2zM19.294 6.634l1 1.732-4.33 2.5-1-1.732zM8.036 13.134l1 1.732-4.33 2.5-1-1.732zM20.294 15.634l-1 1.732-4.33-2.5 1-1.732zM9.036 9.134l-1 1.732-4.33-2.5 1-1.732z" />
  </svg>
);
export default SvgCassetteSpokes;
