export const Spinner = (props: { color?: string; className?: string }) => (
  <svg
    className={`animate-spin text-red ${props.className}`}
    data-testid="spinner-logo"
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="18" cy="18" r="16" stroke="#E2E0E7" strokeWidth="3" />
    <path
      d="M34 18C34 26.8366 26.8366 34 18 34"
      stroke={props.color ?? "#6F3FF5"}
      strokeWidth="3"
    />
  </svg>
);
