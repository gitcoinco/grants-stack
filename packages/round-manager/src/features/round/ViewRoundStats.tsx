import { Spinner } from "../common/Spinner";

export default function ViewRoundStats(props: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  roundStats: any;
  isRoundStatsFetched: boolean;
}) {
  if (props.isRoundStatsFetched) {
    <Spinner text="We're fetching your Round." />;
  }

  return (
    <div className="flex flex-center flex-col mx-auto mt-3">
      <p className="text-xl">Round Stats</p>
    </div>
  );
}
