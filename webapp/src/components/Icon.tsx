import type { ReactNode, SVGProps } from "react";

/**
 * Inline SVG icon set — the plan forbids icon packages, so icons live here.
 * Service rows in the database store an `icon` key that maps into this set.
 */
const paths: Record<string, ReactNode> = {
  laptop: (
    <>
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path d="M2 19h20" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 4.5-2.9 8.2-7 9.5-4.1-1.3-7-5-7-9.5V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  drive: (
    <>
      <rect x="3" y="4" width="18" height="7" rx="2" />
      <rect x="3" y="13" width="18" height="7" rx="2" />
      <path d="M7 7.5h.01M7 16.5h.01" />
    </>
  ),
  headset: (
    <>
      <path d="M4 13v-1a8 8 0 1116 0v1" />
      <path d="M4 13h2.5a1.5 1.5 0 011.5 1.5v3A1.5 1.5 0 016.5 19H6a2 2 0 01-2-2v-4zM20 13h-2.5a1.5 1.5 0 00-1.5 1.5v3a1.5 1.5 0 001.5 1.5h.5a2 2 0 002-2v-4z" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 12h18" />
    </>
  ),
  setup: (
    <>
      <rect x="2.5" y="4" width="19" height="12" rx="2" />
      <path d="M8 20h8M12 16v4M7 10l2 2 4-4" />
    </>
  ),
  wifi: (
    <>
      <path d="M2.5 8.5a16 16 0 0119 0M5.5 12a11 11 0 0113 0M8.5 15.5a6 6 0 017 0" />
      <path d="M12 19h.01" />
    </>
  ),
  devices: (
    <>
      <rect x="2.5" y="5" width="12" height="9" rx="1.5" />
      <rect x="16" y="9" width="5.5" height="11" rx="1.5" />
      <path d="M6 18h5" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1.2" />
      <circle cx="18" cy="20" r="1.2" />
      <path d="M2.5 3h2l2.6 12.2a2 2 0 002 1.6h9.3a2 2 0 002-1.5L22 7H6" />
    </>
  ),
  check: <path d="M4 12.5l5 5L20 6.5" />,
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </>
  ),
  phone: (
    <path d="M6.6 3h-2A1.6 1.6 0 003 4.7C3 13.1 9.9 20 18.3 20a1.6 1.6 0 001.7-1.6v-2a1.6 1.6 0 00-1.3-1.6l-3.2-.6a1.6 1.6 0 00-1.6.7l-.8 1.2a13.6 13.6 0 01-5.2-5.2l1.2-.8a1.6 1.6 0 00.7-1.6l-.6-3.2A1.6 1.6 0 006.6 3z" />
  ),
  mail: (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <path d="M3 6l9 7 9-7" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.5l3.5 2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.1 7-11a7 7 0 10-14 0c0 4.9 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  "arrow-right": <path d="M4 12h16M13 5l7 7-7 7" />,
  menu: <path d="M3.5 6h17M3.5 12h17M3.5 18h17" />,
  close: <path d="M5 5l14 14M19 5L5 19" />,
  sparkle: (
    <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z" />
  ),
  tool: (
    <path d="M14.7 6.3a4.2 4.2 0 005.4 5.4l-8.6 8.6a2.4 2.4 0 01-3.4 0l-1.4-1.4a2.4 2.4 0 010-3.4l8-8.2z" />
  ),
  heart: (
    <path d="M12 20.5S3.5 15 3.5 9.3A4.8 4.8 0 0112 6a4.8 4.8 0 018.5 3.3C20.5 15 12 20.5 12 20.5z" />
  ),
  bolt: <path d="M13 2L4.5 13.5H11l-1 8.5L19 10h-6.5L13 2z" />,
  lock: (
    <>
      <rect x="4.5" y="10" width="15" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 118 0v3" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
};

export interface IconProps extends SVGProps<SVGSVGElement> {
  name: keyof typeof paths | string;
  /** Pixel size; defaults to 24. */
  size?: number;
}

export function Icon({ name, size = 24, className, ...rest }: IconProps) {
  const content = paths[name] ?? paths.sparkle;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      {content}
    </svg>
  );
}
