import { Spinner } from "../common/Spinner";
import { ExclamationCircleIcon as NonFinalizedRoundIcon } from "@heroicons/react/outline";
import { useState } from "react";

export default function ViewFundGrantees(props: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  finalized: boolean;
}) {
  const [isFundGranteesFetched, setIsFundGranteesFetched] = useState(false);
  if (isFundGranteesFetched) {
    <Spinner text="We're fetching your data." />;
  }

  return (
    <div className="flex flex-center flex-col mx-auto mt-3">
      <p className="text-xl">Fund Grantees</p>
      {props.finalized ? null : <NonFinalizedRoundContent />}
    </div>
  );
}

function NonFinalizedRoundMessage() {
  return (
    <>
      <h2 className="mt-8 text-2xl antialiased">Round not finalized yet</h2>
      <div className="mt-2 text-sm">
        You will be able to pay out your grantees once the round results have
        been finalized.
      </div>
      <div className="text-sm">
        You can finalize the results in the Round Results tab.
      </div>
    </>
  );
}

function NonFinalizedRoundContent() {
  return (
    <div className="flex flex-center flex-col mx-auto h-screen items-center text-center mt-32">
      <div className="flex flex-center justify-center items-center bg-grey-150 rounded-full h-12 w-12 text-violet-400">
        <NonFinalizedRoundIcon className="w-6 h-6" />
      </div>
      <NonFinalizedRoundMessage />
    </div>
  );
}
