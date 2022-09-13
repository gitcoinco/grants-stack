import { ReactComponent as SpinnerLogo } from "../../assets/spinner.svg";

type SpinnerProps = {
  text: string;
};

export function Spinner(props: SpinnerProps) {
  return (
    <div className="flex h-screen" data-testid="loading-spinner">
      <div className="m-auto">
        <SpinnerLogo className="mb-4 m-auto" style={{ maxWidth: 100 }} />
        <p>{props.text}</p>
      </div>
    </div>
  );
}
