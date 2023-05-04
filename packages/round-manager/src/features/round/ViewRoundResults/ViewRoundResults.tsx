import React, { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BigNumber, utils } from "ethers";
import { RadioGroup, Tab } from "@headlessui/react";
import {
  ExclamationCircleIcon as NoInformationIcon,
  InformationCircleIcon,
} from "@heroicons/react/outline";
import { DownloadIcon } from "@heroicons/react/solid";
import {
  DropzoneInputProps,
  DropzoneRootProps,
  useDropzone,
} from "react-dropzone";
import { RefreshIcon, ExclamationCircleIcon } from "@heroicons/react/solid";
import { classNames } from "common";
import { useDebugMode, useRound, useRoundMatchingFunds } from "../../../hooks";
import {
  MatchingStatsData,
  ProgressStatus,
  ProgressStep,
} from "../../api/types";
import { Match } from "allo-indexer-client";
import { Spinner } from "../../common/Spinner";
import { stringify } from "csv-stringify/sync";
import { Input } from "csv-stringify/lib";
import { useNetwork, useSigner } from "wagmi";
import InfoModal from "../../common/InfoModal";
import ProgressModal from "../../common/ProgressModal";
import ErrorModal from "../../common/ErrorModal";
import { useFinalizeRound } from "../../../context/round/FinalizeRoundContext";
import { setReadyForPayout } from "../../api/round";
import { errorModalDelayMs } from "../../../constants";
import { useRoundById } from "../../../context/round/RoundContext";
import { TransactionResponse } from "@ethersproject/providers";

// CHECK: should this be in common? Josef: yes indeed
function horizontalTabStyles(selected: boolean) {
  return classNames(
    "py-2 px-4 text-sm leading-5",
    "hover:text-gray-700 focus:outline-none focus:ring-inset focus:ring-indigo-500",
    selected && "text-violet-400 border-violet-400",
    selected ? "border-b-2" : "border-transparent"
  );
}

const distributionOptions = [
  { value: "keep", label: "Keep distribution as is" },
  { value: "scale", label: "Scale up and distribute full pool" },
];

export default function ViewRoundResults() {
  const { chain } = useNetwork();
  const { id } = useParams();
  const navigate = useNavigate();
  const roundId = utils.getAddress(id as string);
  const { data: matches, isLoading: isLoadingMatchingFunds } =
    useRoundMatchingFunds(roundId);
  const debugModeEnabled = useDebugMode();
  const { data: round, isLoading: isLoadingRound } = useRound(roundId);
  const { round: oldRoundFromGraph } = useRoundById(
    (id as string).toLowerCase()
  );
  const { data: signer } = useSigner();
  const isReadyForPayout = Boolean(
    oldRoundFromGraph?.payoutStrategy.isReadyForPayout
  );
  const network = useNetwork();

  const [distributionOption, setDistributionOption] = useState<
    "keep" | "scale"
  >("keep");
  const isBeforeRoundEndDate = round && new Date() < round.roundEndTime;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          /**/
        }
      };
      reader.readAsText(file);
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  const onRecalculateResults = () => {
    // Logic for recalculating results goes here
  };

  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [readyForPayoutTransaction, setReadyforPayoutTransaction] =
    useState<TransactionResponse>();

  const { finalizeRound, IPFSCurrentStatus, finalizeRoundToContractStatus } =
    useFinalizeRound();

  const onFinalizeResults = async () => {
    if (
      !matches ||
      !round ||
      !signer ||
      !oldRoundFromGraph?.payoutStrategy.id
    ) {
      return;
    }

    setWarningModalOpen(false);
    setProgressModalOpen(true);
    try {
      const matchingJson: MatchingStatsData[] = matches.map((match) => ({
        uniqueContributorsCount: 0,
        projectPayoutAddress: match.payoutAddress,
        projectId: match.projectId,
        matchPoolPercentage: 0,
        matchAmountInToken: BigNumber.from(match.matched),
      }));

      await finalizeRound(oldRoundFromGraph.payoutStrategy.id, matchingJson);

      const setReadyForPayoutTx = await setReadyForPayout({
        roundId: round.id,
        signerOrProvider: signer,
      });

      setReadyforPayoutTransaction(setReadyForPayoutTx);

      setTimeout(() => {
        setProgressModalOpen(false);
      }, errorModalDelayMs);
    } catch (error) {
      setTimeout(() => {
        setProgressModalOpen(false);
        setErrorModalOpen(true);
      }, errorModalDelayMs);
      console.error("Error finalizing results", error);
    }
  };

  const progressSteps: ProgressStep[] = [
    {
      name: "saving",
      description:
        "The matching distribution is being saved onto the contract.",
      status: IPFSCurrentStatus,
    },
    {
      name: "Finalizing",
      description: `The contract is being marked as eligible for payouts.`,
      status: finalizeRoundToContractStatus,
    },
    {
      name: "finishing up",
      description: "We’re wrapping up.",
      status:
        finalizeRoundToContractStatus === ProgressStatus.IS_SUCCESS
          ? ProgressStatus.IN_PROGRESS
          : ProgressStatus.NOT_STARTED,
    },
  ];

  if (isBeforeRoundEndDate && !debugModeEnabled) {
    return <NoInformationContent />;
  }

  if (isLoadingRound || isLoadingMatchingFunds) {
    return <Spinner text="We're fetching the matching data." />;
  }

  return (
    <div className="flex flex-center flex-col mx-auto mt-3 mb-[212px]">
      <p className="text-xl font-semibold leading-6 mb-10">Round Results</p>
      <Tab.Group>
        <Tab.List className="border-b mb-6 flex items-center justify-between">
          <div className="space-x-8">
            <Tab className={({ selected }) => horizontalTabStyles(selected)}>
              Finalize Round
            </Tab>
            <Tab className={({ selected }) => horizontalTabStyles(selected)}>
              Raw Round Data
            </Tab>
          </div>
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel>
            <div className="overflow-y-auto">
              <div className="flex flex-col">
                <span className="text-sm leading-5 text-gray-400 text-left">
                  Finalize your round results here. Doing so will allow you to
                  fund your grantees.
                </span>
              </div>
              <div className="flex flex-col mt-4">
                <span className="text-sm leading-5 text-gray-500 font-semibold text-left mb-1 mt-2">
                  Vote Coefficients
                </span>
                <span className="text-sm leading-5 text-gray-400 text-left">
                  Download the CSV file of vote coefficients for a detailed
                  breakdown of transactions, passport scores, and donation
                  amounts.
                </span>
              </div>
              <div className="flex flex-col mt-4 w-min">
                <a
                  role={"link"}
                  href={`${process.env.REACT_APP_ALLO_API_URL}/data/${chain?.id}/rounds/${roundId}/vote_coefficients.csv`}
                  className="bg-gray-100 hover:bg-gray-200 text-black font-bold py-2 px-4 rounded flex items-center gap-2"
                >
                  <DownloadIcon className="h-5 w-5" />
                  CSV
                </a>
              </div>
              <div
                className="flex flex-col mt-4"
                data-testid="match-stats-title"
              >
                <span className="text-sm leading-5 text-gray-500 font-semibold text-left mb-1 mt-2">
                  Matching Distribution
                </span>
              </div>
              <div className="col-span-3 border rounded p-4 row-span-2 overflow-y-auto max-h-52">
                <table
                  className="table-auto border-separate border-spacing-y-4 h-full w-full"
                  data-testid="match-stats-table"
                >
                  <thead>
                    <tr>
                      <th className="text-sm leading-5 text-gray-400 text-left">
                        Projects
                      </th>
                      <th className="text-sm leading-5 text-gray-400 text-left">
                        No. of Contributions
                      </th>
                      <th className="text-sm leading-5 text-gray-400 text-left">
                        Est. Matching %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {round &&
                      matches &&
                      matches.map((match: Match) => {
                        const percentage =
                          Number(
                            (BigInt(1000000) * match.matched) /
                              round.matchAmount
                          ) / 10000;
                        return (
                          <tr key={match.applicationId}>
                            <td className="text-sm leading-5 text-gray-400 text-left">
                              {match.projectName}
                            </td>
                            <td className="text-sm leading-5 text-gray-400 text-left">
                              {match.contributionsCount}
                            </td>
                            <td className="text-sm leading-5 text-gray-400 text-left">
                              {percentage.toString()}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col mt-4 w-min">
                <button
                  onClick={() => {
                    /* Download matching distribution data as csv */
                    if (!matches) {
                      return;
                    }

                    downloadArrayAsCsv(matches, "matches.csv");
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-black font-bold py-2 px-4 rounded flex items-center gap-2"
                >
                  <DownloadIcon className="h-5 w-5" /> CSV
                </button>
              </div>
              <div className="flex flex-col mt-4 gap-1 mb-3">
                <span className="text-sm leading-5 text-gray-500 font-semibold text-left mb-1">
                  Round Saturation
                </span>
                <span className="text-sm leading-5 font-normal text-left">
                  {`Current round saturation: ${-99}%`}
                </span>
                <span className="text-sm leading-5 font-normal text-left">
                  {`$${0} out of the $${0} matching fund will be distributed to grantees.`}
                </span>
              </div>
              <RadioGroup
                value={distributionOption}
                onChange={setDistributionOption}
              >
                <RadioGroup.Label className="sr-only">
                  Distribution options
                </RadioGroup.Label>
                <div className="space-y-2">
                  {distributionOptions.map((option) => (
                    <RadioGroup.Option
                      key={option.value}
                      value={option.value}
                      className={() =>
                        classNames("cursor-pointer flex items-center")
                      }
                    >
                      {({ checked }) => (
                        <>
                          <input
                            type="radio"
                            className="text-indigo-600 focus:ring-indigo-500"
                            checked={checked}
                            readOnly
                          />
                          <span
                            className={classNames(
                              "ml-2 font-medium text-gray-900",
                              checked && "text-indigo-900"
                            )}
                          >
                            {option.label}
                          </span>
                        </>
                      )}
                    </RadioGroup.Option>
                  ))}
                </div>
              </RadioGroup>
              <div className="flex flex-col mt-4">
                <span className="text-sm leading-5 text-gray-500 font-semibold text-left mb-1 mt-2">
                  Revise Results
                </span>
                <div className="text-sm leading-5 text-left mb-1">
                  Upload a CSV with the finalized Vote Coefficient overrides{" "}
                  <b>only</b>. For instructions, click{" "}
                  <a
                    href={
                      "https://support.gitcoin.co/gitcoin-knowledge-base/gitcoin-grants-program/program-managers/how-to-view-your-round-results"
                    }
                  >
                    here
                  </a>
                  .
                </div>
                <div className="text-sm leading-5 text-left flex items-start justify-start">
                  <ExclamationCircleIcon
                    className={"w-8 h-8 text-gray-500 mr-2.5 -mt-1"}
                  />
                  If you navigate away from this page, your data will be lost.
                  You will be able to re-upload data as much as you’d like, but
                  it will not be saved to the contract until you finalize
                  results.
                </div>
                <UploadJSON
                  rootProps={getRootProps()}
                  inputProps={getInputProps()}
                  matchingData={[]}
                  setCustomMatchingData={() => {
                    /**/
                  }}
                />
                <button
                  onClick={onRecalculateResults}
                  className="w-fit bg-violet-100 hover:bg-violet-200 text-violet-400 font-medium py-2 px-4 mt-4 rounded flex items-center gap-2"
                >
                  <RefreshIcon className="h-5 w-5" />
                  Recalculate results
                </button>
                <hr className="my-4" />
                {!isReadyForPayout && (
                  <>
                    <button
                      onClick={() => {
                        setWarningModalOpen(true);
                      }}
                      className="self-end w-fit bg-white hover:bg-pink-200 border border-pink-400 text-pink-400 py-2
                   mt-2 px-3 rounded flex items-center gap-2"
                    >
                      Finalize Results
                    </button>
                    <span className="text-sm leading-5 text-gray-400 mt-5 text-center">
                      The contract will be locked once results are finalized.
                      You will not be able to change the results after you
                      finalize.
                    </span>
                  </>
                )}
                {readyForPayoutTransaction && (
                  <>
                    <button
                      onClick={() => {
                        if (
                          network.chain?.blockExplorers &&
                          readyForPayoutTransaction
                        ) {
                          navigate(
                            `${network.chain.blockExplorers.default.url}/tx/${readyForPayoutTransaction.hash}`
                          );
                        }
                      }}
                      className="self-end w-fit bg-white hover:bg-gray-50 border border-gray-100 text-gray-500 py-2
                   mt-2 px-3 rounded flex items-center gap-2"
                    >
                      View on Etherscan
                    </button>
                  </>
                )}
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <div>{/* raw round data content here */}</div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      <InfoModal
        title={"Warning!"}
        body={<WarningModalBody />}
        isOpen={warningModalOpen}
        setIsOpen={setWarningModalOpen}
        continueButtonAction={onFinalizeResults}
      />
      <ProgressModal
        isOpen={progressModalOpen}
        subheading={"Please hold while we finalize the round results."}
        steps={progressSteps}
      />
      <ErrorModal
        isOpen={errorModalOpen}
        setIsOpen={setErrorModalOpen}
        tryAgainFn={onFinalizeResults}
      />
    </div>
  );
}

export function UploadJSON(props: {
  rootProps: DropzoneRootProps;
  inputProps: DropzoneInputProps;
  matchingData: MatchingStatsData[];
  setCustomMatchingData: (customMatchingStats: MatchingStatsData[]) => void;
}) {
  const [projectIDMismatch] = useState(false);
  const [matchingPerecentMismatch] = useState(false);

  // TODO: implement this when file upload is ready
  // const projectIDs = props.matchingData?.map((data) => data.projectId);
  //
  // const matchingDataSchema = yup.array().of(
  //   yup.object().shape({
  //     projectName: yup.string().required(),
  //     projectId: yup.string().required(),
  //     uniqueContributorsCount: yup.number().required(),
  //     matchPoolPercentage: yup.number().required(),
  //   })
  // );

  /* TODO(1474): adapt this to parse and validate csv instead of JSON + type safety */
  // const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
  //   event.preventDefault();
  //   const fileList = event.dataTransfer.files;
  //   fileList[0].arrayBuffer().then((buffer) => {
  //     const decoder = new TextDecoder("utf-8");
  //     const jsonString = decoder.decode(buffer);
  //     const jsonData = JSON.parse(jsonString);
  //     try {
  //       matchingDataSchema.validateSync(jsonData);
  //       const jsonProjectIDs = jsonData.map((data: any) => data.projectId);
  //       const jsonMatchPoolPercentages = jsonData.map(
  //         (data: any) => data.matchPoolPercentage
  //       );
  //       const idMismatch = !projectIDs?.every((projectID) =>
  //         jsonProjectIDs.includes(projectID)
  //       );
  //       const matchPoolPercentageMismatch = !(
  //         Number(
  //           jsonMatchPoolPercentages
  //             ?.reduce(
  //               (accumulator: number, currentValue: number) =>
  //                 accumulator + currentValue,
  //               0
  //             )
  //             .toFixed(4)
  //         ) === 1
  //       );
  //       setProjectIDMismatch(idMismatch);
  //       setMatchingPerecentMismatch(matchPoolPercentageMismatch);
  //       !idMismatch &&
  //         !matchPoolPercentageMismatch &&
  //         props.setCustomMatchingData(jsonData);
  //     } catch (error) {
  //       props.setCustomMatchingData([]);
  //     }
  //   });
  // };

  return (
    <div className="pt-2 flex flex-col items-start" {...props.rootProps}>
      <div
        className="flex items-center justify-center w-2/4 mt-4"
        data-testid="dropzone"
      >
        <label className="flex flex-col rounded-lg border-4 border-dashed w-full h-42 p-10 group text-center">
          <div className="h-full w-full text-center flex flex-col justify-center items-center  ">
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
                <a className="text-purple-600 hover:underline">Upload a file</a>{" "}
                or drag and drop
              </span>
              <br />
              CSV up to 10MB
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            id="file-input"
            {...props.inputProps}
          />
        </label>
      </div>
      {projectIDMismatch && (
        <p
          data-testid="project-id-mismatch"
          className="rounded-md bg-red-50 py-2 text-pink-500 flex justify-center my-4 text-sm w-2/4"
        >
          <InformationCircleIcon className="w-4 h-4 mr-1 mt-0.5" />
          <span>
            The project IDs in the JSON file do not match actual project IDs.
          </span>
        </p>
      )}
      {matchingPerecentMismatch && (
        <p
          data-testid="matching-perecent-mismatch"
          className="rounded-md bg-red-50 py-2 text-pink-500 flex justify-center my-4 text-sm w-2/4"
        >
          <InformationCircleIcon className="w-4 h-4 mr-1 mt-0.5" />
          <span>
            Matching percent decimal in the JSON file does not add up to 1.
          </span>
        </p>
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

function WarningModalBody() {
  return (
    <div className="text-sm text-grey-400 gap-16">
      Upon finalizing round results, they'll be <b>permanently locked</b> in the
      smart contract, ensuring distribution integrity on the blockchain.{" "}
      <b>Please verify results</b> before confirming, as you'll acknowledge
      their accuracy and accept the permanent locking of the distribution.
    </div>
  );
}

export function downloadArrayAsCsv(data: Input, filename: string): void {
  const csv = stringify(data, {
    header: true,
    quoted: true,
  });

  downloadFile(csv, filename);
}

export function downloadFile(data: BlobPart, filename: string): void {
  const csvBlob = new Blob([data], {
    type: "text/csv;charset=utf-8;",
  });
  const url = window.URL.createObjectURL(csvBlob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
