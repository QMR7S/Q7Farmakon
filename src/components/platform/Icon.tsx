import type { CSSProperties } from "react";
const paths: Record<string, string> = {
  "chevron-down": "m6 9 6 6 6-6",
  "sparkles": "m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3zM19 18l.8 1.8L22 20l-2.2.2L19 22l-.8-1.8L16 20l2.2-.2L19 18z",
  "sliders": "M4 7h16M4 17h16M9 4v6M16 14v6",
  "graduation": "m2 9 10-5 10 5-10 5L2 9zm4 3v5c3 3 9 3 12 0v-5M22 9v8",
  home: "m3 10 9-7 9 7v10H5V10m4 10v-7h6v7",
  courses: "M4 4h16v16H4zM8 4v16M8 9h12",
  learn: "m9 6 10 6-10 6z",
  library: "M4 4h5v16H4zM10 4h4v16h-4zM15 5l4-1 3 15-4 1z",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  search: "M21 21l-5-5m2-6a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12h4",
  user: "M20 21a8 8 0 0 0-16 0m14-14a6 6 0 1 1-12 0 6 6 0 0 1 12 0",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  check: "m5 12 4 4L19 6",
  questions:
    "M9 9a3 3 0 1 1 4 3c-1 1-1 1-1 3m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
  cases: "M9 4V2h6v2M3 7h18v14H3zM12 10v8m-4-4h8",
  ai: "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  notes: "M4 3h16v18H4zM8 8h8M8 12h8M8 16h4",
  plan: "M3 5h18v16H3zM7 2v6m10-6v6M3 10h18",
  stats: "M4 20V10m8 10V4m8 16v-7",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8m0-6v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2",
  sun: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2",
  moon: "M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10",
  lock: "M5 10h14v11H5zM8 10V6a4 4 0 0 1 8 0v4",
  shield: "m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6zM8 12l3 3 5-6",
  wifi: "M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0m-4 4h.01",
  bookmark: "M6 3h12v18l-6-4-6 4z",
  close: "m5 5 14 14M5 19 19 5",
  filter: "M3 5h18M6 12h12M9 19h6",
  clock: "M12 7v6l4 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  logout: "M9 3H3v18h6m5-5 5-4-5-4m-7 4h14",
  globe:
    "M2 12h20M12 2c7 7 7 13 0 20-7-7-7-13 0-20m10 10a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  help: "M9 9a3 3 0 1 1 4 3c-1 1-1 1-1 3m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  collapse: "M4 4h16v16H4zM9 4v16m6-12-3 4 3 4",
};
export default function Icon({
  name,
  size = 20,
  style,
}: {
  name: string;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      <path d={paths[name] ?? paths.grid} />
    </svg>
  );
}
