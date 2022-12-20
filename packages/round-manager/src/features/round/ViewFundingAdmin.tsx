import { Spinner } from "../common/Spinner";

export default function ViewFundingAdmin(props: {
  fundingData: any;
  isFundingDataFetched: boolean;
}) {
  if (props.isFundingDataFetched) {
    <Spinner text="We're fetching your Round." />;
  }

  return (
    <div>
      <h2>Matching Stats</h2>
    </div>
  );
}
