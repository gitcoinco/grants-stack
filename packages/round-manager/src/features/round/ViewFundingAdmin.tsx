import { Spinner } from "../common/Spinner";
import { ExclamationCircleIcon as NoInformationIcon } from "@heroicons/react/outline";

export default function ViewFundingAdmin(props: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fundingData: any;
  isFundingDataFetched: boolean;
}) {
  if (props.isFundingDataFetched) {
    <Spinner text="We're fetching your Round." />;
  }

  return (
    <div>
      <NoInformationContent />
    </div>
  );
}

function NoInformationContent() {
  return (
    <div className="flex flex-center flex-col mx-auto h-screen items-center text-center mt-32">
      <div className="flex flex-center justify-center items-center bg-grey-150 rounded-full h-12 w-12 text-violet-400">
        <NoInformationIcon className="w-6 h-6" />
      </div>
      <NoInformationMessage />
    </div>
  );
}

function NoInformationMessage() {
  return (
    <>
      <h2 className="mt-8 text-2xl antialiased">No Information Available</h2>
      <div className="mt-2 text-sm">Your round has not ended yet.</div>
      <div className="text-sm">
        Final matching fund percentage will be available once the round has
        finalized.
      </div>
    </>
  );
}
