type SpinnerProps = {
  text: string;
};

export function Spinner(props: SpinnerProps) {
  return (
    <div className="w-full" data-testid="loading-spinner">
      <div className="mt-7 md:mt-28 flex flex-col gap-10 items-center">
        <LoadingRing className="animate-spin" />
        <div>
          <h4 className="mb-2 text-center">Loading...</h4>
          <p className="text-sm text-grey-400 text-center">{props.text}</p>
        </div>
      </div>
    </div>
  );
}

export const LoadingRing = (props: { className?: string }) => (
  <svg
    className={props.className}
    data-testid="spinner-logo"
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="18" cy="18" r="16" stroke="#E2E0E7" strokeWidth="4" />
    <path
      d="M34 18C34 26.8366 26.8366 34 18 34"
      stroke="#0E0333"
      strokeWidth="4"
    />
  </svg>
);
