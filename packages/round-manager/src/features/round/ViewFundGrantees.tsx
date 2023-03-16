import { Spinner } from "../common/Spinner";
import { ExclamationCircleIcon as NonFinalizedRoundIcon } from "@heroicons/react/outline";
import { useState } from "react";
import { Tab } from "@headlessui/react";
import tw from "tailwind-styled-components";

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
      {!props.finalized ? (
        <FinalizedRoundContent />
      ) : (
        <NonFinalizedRoundContent />
      )}
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

function FinalizedRoundContent() {
  const tabStyles = (selected: boolean) =>
    selected
      ? "border-violet-500 whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm outline-none"
      : "border-transparent text-grey-400 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 font-medium text-sm";

  const TabApplicationCounter = tw.div`
    rounded-md
    ml-2
    w-8
    h-5
    float-right
    font-sm
    font-normal
    `;

  return (
    <div>
      <div>
        <Tab.Group>
          <div className="justify-end grow relative">
            <Tab.List className="border-b mb-6 flex items-center justify-between">
              <div className="space-x-8">
                <Tab className={({ selected }) => tabStyles(selected)}>
                  {({ selected }) => (
                    <div className={selected ? "text-violet-500" : ""}>
                      Unpaid Grantees
                      <TabApplicationCounter
                        className={selected ? "bg-violet-100" : "bg-grey-150"}
                        data-testid="received-application-counter"
                      >
                        {0}
                      </TabApplicationCounter>
                    </div>
                  )}
                </Tab>
                <Tab className={({ selected }) => tabStyles(selected)}>
                  {({ selected }) => (
                    <div className={selected ? "text-violet-500" : ""}>
                      Paid Grantees
                      <TabApplicationCounter
                        className={selected ? "bg-violet-100" : "bg-grey-150"}
                        data-testid="received-application-counter"
                      >
                        {0}
                      </TabApplicationCounter>
                    </div>
                  )}
                </Tab>
              </div>
            </Tab.List>
          </div>
        </Tab.Group>
      </div>
    </div>
  );
}
