import { Spinner } from "../common/Spinner";
import { ExclamationCircleIcon as NoInformationIcon } from "@heroicons/react/outline";
import { MatchingStatsData, Round } from "../api/types";
import { useRoundMatchData } from "../api/api";
import { Button } from "../common/styles";
import { saveObjectAsJson } from "../api/utils";
import { RadioGroup } from "@headlessui/react";
import { updateRoundDistribution } from "../api/round";
import { useWallet } from "../common/Auth";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";

export default function ViewFundingAdmin(props: {
  round: Round | undefined;
  chainId: string;
  roundId: string | undefined;
}) {
  const currentTime = new Date();
  const isBeforeRoundEndDate =
    props.round && props.round.roundEndTime >= currentTime;
  const isAfterRoundEndDate =
    props.round && props.round.roundEndTime <= currentTime;

  return (
    <div>
      {isBeforeRoundEndDate && <NoInformationContent />}
      {isAfterRoundEndDate && (
        <InformationContent
          round={props.round}
          chainId={props.chainId}
          roundId={props.roundId}
        />
      )}
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

function InformationContent(props: {
  round: Round | undefined;
  chainId: string;
  roundId: string | undefined;
}) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { data, error, loading } = useRoundMatchData(
    props.chainId,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    props.roundId!
  );

  const matchingData: MatchingStatsData[] | undefined = data?.map((data) => {
    const project = props.round?.approvedProjects?.filter(
      (project) =>
        project.grantApplicationId.toLowerCase() ===
        data.projectId.toLowerCase()
    )[0];
    return {
      projectName: project?.projectMetadata?.title
        ? project.projectMetadata.title
        : "Unknown",
      projectId: data.projectId,
      uniqueContributorsCount: data.uniqueContributorsCount,
      matchPoolPercentage: data.matchPoolPercentage,
    };
  });
  return (
    <>
      <div>
        {loading && <Spinner text="We're fetching the matching data." />}
        {!error && !loading && <InformationTable matchingData={matchingData} />}
        {error && <ErrorMessage />}
      </div>
      {!error && !loading && <FinalizeRound />}
    </>
  );
}

function ErrorMessage() {
  return (
    <div className="flex flex-center flex-col mx-auto h-screen items-center text-center mt-32">
      <div className="flex flex-center justify-center items-center bg-grey-150 rounded-full h-12 w-12 text-violet-400">
        <NoInformationIcon className="w-6 h-6" />
      </div>
      <h2 className="mt-8 text-2xl antialiased" data-testid="error-info">
        Error
      </h2>
      <div className="mt-2 text-sm">There was an error fetching the data.</div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function InformationTable(props: {
  matchingData: MatchingStatsData[] | undefined;
}) {
  return (
    <div className="mt-8 ml-8">
      <div className="flex flex-row relative">
        <p className="ml-4 font-bold" data-testid="final-match-stats-title">
          Finalized Matching Stats
        </p>
        <p className="ml-4 font-bold text-violet-400 absolute left-3/4 ml-32">
          ({props.matchingData?.length}) Projects
        </p>
      </div>
      <div className="flex flex-flow mt-2 overflow-y-auto h-72 border-2 px-4 py-4">
        <table className="w-full" data-testid="matching-stats-table">
          <thead>
            <tr className="text-left">
              <th>Project Name</th>
              <th>Project ID</th>
              <th>No of Contributors</th>
              <th>Matching %</th>
            </tr>
          </thead>
          <tbody>
            {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              props.matchingData?.map((data: any) => (
                <tr key={data.projectId}>
                  <td className="py-2">
                    {data.projectName.slice(0, 16) + "..."}
                  </td>
                  <td className="py-2">
                    {data.projectId.slice(0, 32) + "..."}
                  </td>
                  <td className="py-2">{data.uniqueContributorsCount}</td>
                  <td className="py-2">
                    {data.matchPoolPercentage.toFixed(4) * 100 + "%"}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      <div className="relative mt-4 mb-8">
        <Button
          onClick={() => {
            if (props.matchingData) {
              saveObjectAsJson("matching_data.json", props.matchingData);
            }
          }}
          type="button"
          className="absolute right-0"
          data-testid="download-json"
        >
          Download JSON
        </Button>
      </div>
    </div>
  );
}

function FinalizeRound() {
  const { signer } = useWallet();
  const { id: roundId } = useParams();

  return (
    <div className="w-full pt-12">
      <span>Finalize Round</span>
      <hr className="mt-2 mb-4" />
      <div className="flex columns-2 pl-8">
        <div className="w-full pt-2">
          <form className="mt-4 space-y-3 w-full" action="#" method="POST">
            <div className="grid grid-cols-2 space-y-2">
              <div className="w-full pt-2">
                <RadioGroup data-testid="default-or-upload-radio">
                  <RadioGroup.Label className="block text-sm">
                    <p className="text-sm">
                      <span>
                        Use default finalized matching stats or upload your own?
                      </span>
                    </p>
                  </RadioGroup.Label>
                  <div className="flex flex-row gap-4 mt-3">
                    <RadioGroup.Option value={true}>
                      {({ checked, active }) => (
                        <span className="flex items-center text-sm">
                          <span
                            className={classNames(
                              checked
                                ? "bg-indigo-600 border-transparent"
                                : "bg-white border-gray-300",
                              active
                                ? "ring-2 ring-offset-2 ring-indigo-500"
                                : "",
                              "h-4 w-4 rounded-full border flex items-center justify-center"
                            )}
                            aria-hidden="true"
                          >
                            <span className="rounded-full bg-white w-1.5 h-1.5" />
                          </span>
                          <RadioGroup.Label
                            as="span"
                            className="ml-3 block text-sm text-gray-700"
                            data-testid="use-default-true"
                          >
                            Use Default
                          </RadioGroup.Label>
                        </span>
                      )}
                    </RadioGroup.Option>
                    <RadioGroup.Option value={false}>
                      {({ checked, active }) => (
                        <span className="flex items-center text-sm">
                          <span
                            className={classNames(
                              checked
                                ? "bg-indigo-600 border-transparent"
                                : "bg-white border-gray-300",
                              active
                                ? "ring-2 ring-offset-2 ring-indigo-500"
                                : "",
                              "h-4 w-4 rounded-full border flex items-center justify-center"
                            )}
                            aria-hidden="true"
                          >
                            <span className="rounded-full bg-white w-1.5 h-1.5" />
                          </span>
                          <RadioGroup.Label
                            as="span"
                            className="ml-3 block text-sm text-gray-700"
                            data-testid="upload-own-true"
                          >
                            Upload my own JSON
                          </RadioGroup.Label>
                        </span>
                      )}
                    </RadioGroup.Option>
                  </div>
                </RadioGroup>
              </div>
              <div className="w-full pt-2">
                <p className="text-sm">
                  <span>
                    Upload JSON file with finalized matching percentage
                  </span>
                </p>
                <div className="flex items-center justify-center w-full mt-4">
                  <label className="flex flex-col rounded-lg border-4 border-dashed w-full h-42 p-10 group text-center">
                    <div className="h-full w-full text-center flex flex-col items-center justify-center items-center  ">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 48 48"
                        stroke="currentColor"
                        className="mx-auto w-12 h-12 text-gray-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M24 32.5V19.75m0 0l6 6m-6-6l-6 6M13.5 39.5a9 9 0 01-2.82-17.55 10.5 10.5 0 0120.465-4.66 6 6 0 017.517 7.696A7.504 7.504 0 0136 39.5H13.5z"
                        />
                      </svg>
                      <p className="pointer-none text-gray-500 ">
                        <span>
                          <a
                            href=""
                            id=""
                            className="text-purple-600 hover:underline"
                          >
                            Upload a file
                          </a>{" "}
                          or drag and drop
                        </span>
                        <br />
                        JSON up to xMB
                      </p>
                    </div>
                    <input type="file" className="hidden" />
                  </label>
                </div>
              </div>
            </div>
            <div className="grid justify-items-end">
              <div className="w-fit">
                <Button
                  onClick={async () => {
                    /* TODO: display the warning window here */
                    /* ABI-encode the distrbution TODO: what is the format of this? */
                    // let newDistribution = ethers.utils.defaultAbiCoder.encode();
                    /* Set the distribution in the contract */
                    // updateRoundDistribution(roundId, signer, newDistribution);
                  }}
                  type="submit"
                  className="my-5 w-full flex justify-center tracking-wide focus:outline-none focus:shadow-outline shadow-lg cursor-pointer"
                >
                  Finalize and save to contract
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
