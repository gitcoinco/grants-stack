import { Spinner } from "../common/Spinner";

export default function ViewFundGrantees(props: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  grantees: any;
  isFundGranteesFetched: boolean;
}) {
  if (props.isFundGranteesFetched) {
    <Spinner text="We're fetching your data." />;
  }

  return (
    <div className="flex flex-center flex-col mx-auto mt-3">
      <p className="text-xl">Fund Grantees</p>
    </div>
  );
}
