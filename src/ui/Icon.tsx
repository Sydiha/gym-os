const paths = {
  meal: (
    <>
      <path d="M4 2v8m3-8v8m3-8v8M4 10h6M7 10v12M18 2c-2 0-3 3-3 7v3h4V2h-1ZM17 12v10" />
    </>
  ),
  walk: (
    <>
      <path d="M2 17c3 0 5-2 7-6l2-4 3 5 4 2 3 1v5H2zM10 11l3 2m-5 1 3 2M2 20h19" />
    </>
  ),
  gym: (
    <>
      <path d="M3 8v8m3-11v14m3-10v6m0-3h6m0-3v6m3-10v14m3-11v8" />
    </>
  ),
  home: (
    <>
      <path d="m3 11 9-8 9 8v10h-6v-7H9v7H3z" />
    </>
  ),
  progress: (
    <>
      <path
        d="M4 20v-5m5 5V9m5 11V5m5 15V2"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="7" r="3" />
      <path d="M5 21c0-4 3-7 7-7s7 3 7 7" />
    </>
  ),
};
export type IconName = keyof typeof paths;
export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
