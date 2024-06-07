import { useCallback, useState, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RadioGroup, Tab } from "@headlessui/react";
import { ExclamationCircleIcon as NoInformationIcon } from "@heroicons/react/outline";
import {
  DownloadIcon,
  ExclamationCircleIcon,
  UploadIcon,
} from "@heroicons/react/solid";
import { useDropzone } from "react-dropzone";
import { classNames, isGG20Round, getPayoutTokens, TToken } from "common";
import { Button } from "common/src/styles";
import { useDebugMode, useRoundMatchingFunds } from "../../../hooks";
import {
  GrantApplication,
  ProgressStatus,
  ProgressStep,
  Round,
  RevisedMatch,
} from "../../api/types";
import { useMatchCSVParser } from "../../api/utils";
import { LoadingRing, Spinner } from "../../common/Spinner";
import { stringify } from "csv-stringify/sync";
import { Input } from "csv-stringify/lib";
import InfoModal from "../../common/InfoModal";
import ProgressModal from "../../common/ProgressModal";
import ErrorModal from "../../common/ErrorModal";
import { useFinalizeRound } from "../../../context/round/FinalizeRoundContext";
import { errorModalDelayMs } from "../../../constants";
import { useRoundById } from "../../../context/round/RoundContext";
import { roundApplicationsToCSV } from "../../api/exports";
import { DistributionMatch } from "data-layer";
import { utils } from "ethers";
import { useContractAmountFunded } from "../FundContract";
import { useApplicationsByRoundId } from "../../common/useApplicationsByRoundId";
import { useAccount } from "wagmi";

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

/** Manages the state of the matching funds,
 * fetching revised matches and merging them with the original matches
 */
function useRevisedMatchingFunds(
  round: Round,
  ignoreSaturation: boolean,
  overridesFile?: File
) {
  const roundId = round.id;
  const originalMatches = useRoundMatchingFunds(roundId);
  const revisedMatches = useRoundMatchingFunds(
    roundId,
    ignoreSaturation,
    overridesFile
  );

  const isRevised =
    (Boolean(overridesFile) || ignoreSaturation) && !revisedMatches.isLoading;

  const error = revisedMatches.error || originalMatches.error;
  const isLoading = revisedMatches.isLoading || originalMatches.isLoading;

  const matches = useMemo(() => {
    if (!originalMatches.data || !revisedMatches.data || error) {
      return undefined;
    }

    // if the round is set to payout, return the finalized matches
    if (
      round.matchingDistribution !== null &&
      round.readyForPayoutTransaction !== null
    ) {
      return round.matchingDistribution.matchingDistribution.map((m) => {
        return {
          applicationId: m.applicationId,
          payoutAddress: m.projectPayoutAddress,
          projectId: m.projectId,
          projectName: m.projectName,
          contributionsCount: m.contributionsCount,
          revisedContributionCount: m.contributionsCount,
          matched: BigInt(m.originalMatchAmountInToken ?? 0),
          revisedMatch: BigInt(m.matchAmountInToken ?? 0),
        };
      });
    }

    const mergedMatchesMap: Record<string, RevisedMatch> = {};

    // push original matches
    for (const match of originalMatches.data) {
      mergedMatchesMap[match.applicationId] = {
        ...match,
        revisedContributionCount: 0,
        revisedMatch: BigInt(0),
      };
    }

    // set revised match values
    for (const match of revisedMatches.data) {
      const originalMatch = mergedMatchesMap[match.applicationId];

      if (originalMatch) {
        mergedMatchesMap[match.applicationId] = {
          ...originalMatch,
          revisedContributionCount: match.contributionsCount,
          revisedMatch: match.matched,
        };
      }
    }

    const mergedMatches = Object.values(mergedMatchesMap);

    mergedMatches.sort((a, b) => {
      if (a.matched > b.matched) {
        return -1;
      }

      if (a.matched === b.matched) {
        return 0;
      }

      return 1;
    });

    return mergedMatches;
  }, [
    originalMatches.data,
    revisedMatches.data,
    error,
    round.matchingDistribution,
    round.readyForPayoutTransaction,
  ]);

  return {
    matches,
    isLoading,
    error,
    isRevised,
    mutate() {
      revisedMatches.mutate();
      originalMatches.mutate();
    },
  };
}

export default function ViewRoundResultsWrapper() {
  const { chainId, id } = useParams() as { chainId?: string; id: string };
  const { chain } = useAccount();

  const roundChainId = chainId ? Number(chainId) : chain?.id;

  if (!id || !roundChainId) {
    return <div>Invalid round ID</div>;
  }

  return <ViewRoundResultsWithId chainId={roundChainId} id={id} />;
}

function ViewRoundResultsWithId({
  chainId,
  id,
}: {
  chainId: number;
  id: string;
}) {
  const round = useRoundById(chainId, id.toLowerCase());
  const applications = useApplicationsByRoundId(id.toLowerCase());

  if (
    round.fetchRoundStatus === ProgressStatus.IN_PROGRESS ||
    applications.isLoading
  ) {
    return <Spinner text="We're fetching the matching data." />;
  }

  if (
    round.error ||
    round.fetchRoundStatus === ProgressStatus.IS_ERROR ||
    applications.error ||
    applications.data === undefined ||
    round.round === undefined
  ) {
    return <div>Failed to load the round</div>;
  }

  const matchTokenAddress = round.round.token;

  if (round.round.chainId === undefined) {
    return <div>Invalid chain id</div>;
  }

  const matchToken = getPayoutTokens(round.round.chainId).find(
    (t) => t.address.toLowerCase() == matchTokenAddress.toLowerCase()
  );

  if (matchToken === undefined) {
    return <div>Invalid round token</div>;
  }

  return (
    <ViewRoundResults
      roundId={id}
      applications={applications.data}
      round={round.round}
      matchToken={matchToken}
    />
  );
}

function ViewRoundResults({
  roundId,
  applications,
  round,
  matchToken,
}: {
  roundId: string;
  applications: GrantApplication[];
  round: Round;
  matchToken: TToken;
}) {
  const { chain, address } = useAccount();
  const debugModeEnabled = useDebugMode();
  const navigate = useNavigate();

  const matchingTableRef = useRef<HTMLDivElement>(null);
  const [overridesFile, setOverridesFile] = useState<undefined | File>();
  const [customResultsFile, setCustomResultsFile] = useState<
    undefined | File
  >();

  const {
    data: customMatches,
    loading: customMatchesLoading,
    error: customMatchesError,
  } = useMatchCSVParser(customResultsFile ?? null);

  const [distributionOption, setDistributionOption] = useState<
    "keep" | "scale"
  >("keep");

  const [isRecommendedDistribution, setIsRecommendedDistribution] =
    useState<boolean>(true);

  const {
    matches,
    isRevised: areMatchingFundsRevised,
    error: matchingFundsError,
    isLoading: isLoadingMatchingFunds,
    mutate: reloadMatchingFunds,
  } = useRevisedMatchingFunds(
    round,
    distributionOption === "scale",
    overridesFile
  );

  const readyForPayoutTransactionHash = round.readyForPayoutTransaction;
  const isReadyForPayout = readyForPayoutTransactionHash !== null;

  const shouldShowRevisedTable =
    areMatchingFundsRevised || Boolean(readyForPayoutTransactionHash);

  const shouldShowCustomResultsTable = Boolean(customResultsFile);

  const { data: amountFunded } = useContractAmountFunded({
    round: round,
    payoutToken: matchToken,
  });

  const isRoundFullyFunded =
    (amountFunded?.fundedAmount ?? 0) >= round.matchAmount;

  const [isExportingApplicationsCSV, setIsExportingApplicationsCSV] =
    useState(false);

  const isBeforeRoundEndDate = round && new Date() < round.roundEndTime;

  const sumOfMatches = useMemo(() => {
    return (
      matches?.reduce(
        (acc: bigint, match) => acc + (match.revisedMatch ?? BigInt(0)),
        BigInt(0)
      ) ?? BigInt(0)
    );
  }, [matches]);

  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  const { finalizeRound, finalizeRoundToContractStatus, IPFSCurrentStatus } =
    useFinalizeRound();

  const onFinalizeResults = async () => {
    const finalMatches = isCustomResults ? customMatches : matches;
    if (!finalMatches || !address) {
      return;
    }

    setWarningModalOpen(false);
    setProgressModalOpen(true);
    try {
      const matchingJson: DistributionMatch[] = finalMatches.map((match) => {
        const app = applications.find(
          (app) => app.applicationIndex.toString() == match.applicationId
        );

        /// should not happen
        if (app === undefined) {
          throw new Error("Application not found");
        }

        return {
          contributionsCount: match.contributionsCount,
          projectPayoutAddress: match.payoutAddress,
          anchorAddress: app.anchorAddress,
          applicationId: match.applicationId,
          matchPoolPercentage:
            Number((BigInt(1000000) * match.revisedMatch) / round.matchAmount) /
            1000000,
          projectId: match.projectId,
          projectName: match.projectName,
          matchAmountInToken: match.revisedMatch.toString(),
          originalMatchAmountInToken: match.matched.toString(),
        };
      });

      await finalizeRound(roundId, round.payoutStrategy.id, matchingJson);

      setTimeout(() => {
        setProgressModalOpen(false);
        navigate(0);
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
      name: "Uploading to IPFS",
      description: "The matching distribution is being uploaded to IPFS.",
      status: IPFSCurrentStatus,
    },
    {
      name: "Finalizing",
      description:
        "The matching distribution is being uploaded to the contract.",
      status: finalizeRoundToContractStatus,
    },
    {
      name: "Redirecting",
      description: "Just another moment while we finish things up.",
      status:
        finalizeRoundToContractStatus === ProgressStatus.IS_SUCCESS
          ? ProgressStatus.IN_PROGRESS
          : ProgressStatus.NOT_STARTED,
    },
  ];

  if (!chain || (isBeforeRoundEndDate && !debugModeEnabled)) {
    return <NoInformationContent />;
  }

  const roundSaturation =
    Number(
      ((sumOfMatches * BigInt(10_000)) / round.matchAmount) * BigInt(10_000)
    ) / 1_000_000;

  const disableRoundSaturationControls = Math.round(roundSaturation) >= 100;

  const sybilDefense = isGG20Round(round.id, chain.id)
    ? "passport-mbds"
    : round.roundMetadata?.quadraticFundingConfig?.sybilDefense;

  const isCustomResults =
    (sybilDefense === "passport-mbds" && isRecommendedDistribution) ||
    (sybilDefense !== "passport-mbds" && !isRecommendedDistribution);

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
              {!readyForPayoutTransactionHash && (
                <div className="flex flex-col">
                  <span className="text-sm leading-5 text-gray-400 text-left">
                    Finalize your round results here. Doing so will allow you to
                    fund your grantees. Please make sure to fully fund the round
                    contract on the Fund Contract tab before finalizing results.
                  </span>
                </div>
              )}
              {readyForPayoutTransactionHash && (
                <div className="flex flex-col mb-6">
                  <span className="text-md leading-5 text-gray-500 font-semibold text-left mb-3 mt-2">
                    Finalized Round Results
                  </span>
                  <span className="text-sm leading-5 text-gray-400 text-left">
                    Round results have been finalized. Grantees can now be paid
                    out their funds.
                  </span>
                </div>
              )}
              <div className="flex flex-col mt-4">
                <span className="text-sm leading-5 text-gray-500 font-semibold text-left mb-2 mt-2">
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
                  href={`${process.env.REACT_APP_INDEXER_V2_API_URL}/api/v1/chains/${chain?.id}/rounds/${roundId}/exports/vote_coefficients`}
                  className="bg-gray-100 hover:bg-gray-200 text-black font-bold py-2 px-4 rounded flex items-center gap-2"
                >
                  <DownloadIcon className="h-5 w-5" />
                  CSV
                </a>
              </div>
              {/* Matching Distribution*/}
              <div
                className="mt-6 pt-6 mb-4 border-t border-gray-100"
                data-testid="match-stats-title"
                ref={matchingTableRef}
              >
                <p className="text-sm leading-5 text-gray-500 font-semibold text-left">
                  {sybilDefense === "passport-mbds"
                    ? "Matching Distribution"
                    : areMatchingFundsRevised
                      ? "Revised Matching Distribution"
                      : "Matching Distribution"}
                </p>
                {!readyForPayoutTransactionHash &&
                  (sybilDefense === "passport-mbds" ? (
                    <p className="text-sm mt-2">
                      Frictionless auto-sybil detection
                    </p>
                  ) : sybilDefense === "passport" ? (
                    <p className="text-sm mt-2">
                      Manual verification with Passport
                    </p>
                  ) : (
                    <p className="text-sm mt-2">Manual Verification</p>
                  ))}
                {!readyForPayoutTransactionHash && (
                  <div>
                    <RadioGroup
                      value={isRecommendedDistribution}
                      onChange={setIsRecommendedDistribution}
                    >
                      <RadioGroup.Option value={true}>
                        {({ checked }) => (
                          <div className="cursor-pointer flex flex-row my-2">
                            <input
                              type="radio"
                              className="text-indigo-600 items-start mt-0.5 focus:ring-indigo-500"
                              checked={checked}
                              readOnly
                            />
                            {sybilDefense === "passport-mbds" ? (
                              <div className="flex flex-col">
                                <span className="text-sm ml-2 text-gray-900">
                                  <a className="text-violet-400">Recommended</a>{" "}
                                  - Upload your own results using the Passport
                                  Model-Based Detection system + result
                                  verification
                                </span>
                                <span className="text-sm mt-1 ml-2 text-gray-400">
                                  Since you selected frictionless auto-sybil
                                  detection at setup, select this option. Please
                                  use this{" "}
                                  <a
                                    className="underline"
                                    target="_blank"
                                    href={`https://qf-calculator.fly.dev/?round_id=${round.id}&chain_id=${chain.id}`}
                                  >
                                    cluster matching template
                                  </a>{" "}
                                  to calculate your results. Click{" "}
                                  <a
                                    className="underline"
                                    target="_blank"
                                    href="https://roundoperations.gitcoin.co/round-operations/post-round/cluster-matching-and-csv-upload"
                                  >
                                    here
                                  </a>{" "}
                                  to learn more.
                                </span>
                              </div>
                            ) : sybilDefense === "passport" ? (
                              <div className="flex flex-col">
                                <span className="text-sm ml-2 text-gray-900">
                                  <a className="text-violet-400">Recommended</a>{" "}
                                  - System default quadratic funding calculation
                                </span>
                                <span className="text-sm mt-1 ml-2 text-gray-400">
                                  Since you selected manual verification with
                                  Passport at setup, select this option to
                                  calculate your round’s final results.
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col">
                                <span className="text-sm ml-2 text-gray-900">
                                  <a className="text-violet-400">Recommended</a>{" "}
                                  - System default quadratic funding calculation
                                </span>
                                <span className="text-sm mt-1 ml-2 text-gray-400">
                                  Since you selected manual verification at
                                  setup, select this option to calculate your
                                  round’s final results.
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </RadioGroup.Option>
                      <RadioGroup.Option value={false}>
                        {({ checked }) => (
                          <div className="cursor-pointer flex my-2">
                            <input
                              type="radio"
                              className="text-indigo-600 items-start mt-0.5 focus:ring-indigo-500"
                              checked={checked}
                              readOnly
                            />
                            {sybilDefense === "passport-mbds" ? (
                              <span className="text-sm ml-2 text-gray-900">
                                System default quadratic funding calculation
                              </span>
                            ) : sybilDefense === "passport" ? (
                              <span className="text-sm ml-2 text-gray-900">
                                Upload your own results
                              </span>
                            ) : (
                              <span className="text-sm ml-2 text-gray-900">
                                Upload your own results
                              </span>
                            )}
                          </div>
                        )}
                      </RadioGroup.Option>
                    </RadioGroup>
                  </div>
                )}
              </div>
              {isCustomResults && !readyForPayoutTransactionHash && (
                <>
                  <UploadCustomResults
                    customResultsFile={customResultsFile}
                    setCustomResultsFile={setCustomResultsFile}
                    reloadMatchingFunds={reloadMatchingFunds}
                    shouldShowCustomResultsTable={shouldShowCustomResultsTable}
                  />
                  <MatchingDistributionPreview
                    matches={customMatches}
                    isLoadingMatchingFunds={customMatchesLoading}
                    matchingFundsError={customMatchesError}
                    shouldShowRevisedTable={false}
                    round={round}
                    matchToken={matchToken}
                  />
                </>
              )}
              {(!isCustomResults || readyForPayoutTransactionHash) && (
                <>
                  <MatchingDistributionPreview
                    matches={matches}
                    isLoadingMatchingFunds={isLoadingMatchingFunds}
                    matchingFundsError={matchingFundsError}
                    shouldShowRevisedTable={shouldShowRevisedTable}
                    round={round}
                    matchToken={matchToken}
                  />
                  <DownloadMatchesAsCSV matches={matches} />
                  <RoundSaturationView
                    roundSaturation={roundSaturation}
                    sumOfMatches={sumOfMatches}
                    round={round}
                    matchToken={matchToken}
                  />
                </>
              )}
              {!isCustomResults && !readyForPayoutTransactionHash && (
                <>
                  <RoundSaturationOptions
                    distributionOption={distributionOption}
                    setDistributionOption={setDistributionOption}
                    disableRoundSaturationControls={
                      disableRoundSaturationControls
                    }
                  />
                  <ReviseVotingCoefficients
                    overridesFile={overridesFile}
                    setOverridesFile={setOverridesFile}
                    reloadMatchingFunds={reloadMatchingFunds}
                    matchingTableRef={matchingTableRef}
                    shouldShowRevisedTable={shouldShowRevisedTable}
                  />
                </>
              )}
              {!readyForPayoutTransactionHash && (
                <>
                  <FinalizeResultsButton
                    isReadyForPayout={isReadyForPayout}
                    isRoundFullyFunded={isRoundFullyFunded}
                    setWarningModalOpen={setWarningModalOpen}
                  />
                </>
              )}
              {readyForPayoutTransactionHash && (
                <ViewTransactionButton
                  readyForPayoutTransactionHash={readyForPayoutTransactionHash}
                />
              )}
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <div className="text-sm leading-5 text-gray-400 text-left pb-4">
              Download and use the data models provided to analyze your round
              results in-depth.
            </div>
            <div className="text-sm leading-5 text-gray-500 font-semibold text-left mb-3 mt-2">
              Round Generated Data
            </div>
            <div className="text-sm leading-5 text-gray-400 text-left">
              Download the raw data for your round, which is separated into four
              data tables: raw votes, projects, round, and prices.
            </div>
            <div className="pt-6">
              <a
                className="flex items-center mb-4"
                href={`${process.env.REACT_APP_INDEXER_V2_API_URL}/api/v1/chains/${chain?.id}/rounds/${roundId}/exports/votes`}
              >
                <span className="w-40">Raw Votes</span>
                <DownloadIcon className="h-5 w-5" />
              </a>
              <button
                className="flex items-center mb-4 text-left"
                disabled={isExportingApplicationsCSV}
                onClick={async (e) => {
                  e.preventDefault();
                  try {
                    setIsExportingApplicationsCSV(true);
                    round &&
                      (await exportAndDownloadApplicationsCSV(
                        round.id,
                        chain.id,
                        round.id.startsWith("0x")
                          ? round.id
                          : round.payoutStrategy.id
                      ));
                  } finally {
                    setIsExportingApplicationsCSV(false);
                  }
                }}
              >
                <span className="w-40">Projects</span>
                {isExportingApplicationsCSV ? (
                  <LoadingRing className="h-5 w-5 animate-spin" />
                ) : (
                  <DownloadIcon className="h-5 w-5" />
                )}
              </button>
              <a
                className="flex items-center mb-4"
                href={`${process.env.REACT_APP_INDEXER_V2_API_URL}/api/v1/chains/${chain?.id}/rounds/${roundId}/exports/round`}
              >
                <span className="w-40">Round</span>
                <DownloadIcon className="h-5 w-5" />
              </a>
              <a
                className="flex items-center mb-4"
                href={`${process.env.REACT_APP_INDEXER_V2_API_URL}/api/v1/chains/${chain?.id}/rounds/${roundId}/exports/prices`}
              >
                <span className="w-40">Prices</span>
                <DownloadIcon className="h-5 w-5" />
              </a>
            </div>
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

export function FileUploader(props: {
  file: File | undefined;
  onSelectFile: (file: File) => void;
}) {
  const { onSelectFile } = props;

  const onDrop = useCallback(
    (files: File[]) => {
      if (files[0]) {
        onSelectFile(files[0]);
        return;
      }
    },
    [onSelectFile]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "text/csv": [] },
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div className="pt-2 flex flex-col items-start" {...getRootProps()}>
      <div
        className="flex items-center justify-center w-2/4 mt-4"
        data-testid="dropzone"
      >
        <label className="flex flex-col rounded-lg border border-dashed border-gray-100 w-full h-42 p-10 group text-center">
          <div className="h-full w-full text-center flex flex-col justify-center items-center  ">
            <span className="font-bold block mb-4">{props.file?.name}</span>
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
            <p className="pointer-none text-grey-400">
              <span>
                <a className="text-violet-400 hover:underline">Upload a file</a>{" "}
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
            {...getInputProps()}
          />
        </label>
      </div>
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

async function exportAndDownloadApplicationsCSV(
  roundId: string,
  chainId: number,
  litContractAddress: string
) {
  const csv = await roundApplicationsToCSV(
    roundId,
    chainId,
    litContractAddress,
    true
  );
  // create a download link and click it
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  return downloadFile(blob, `projects-${roundId}.csv`);
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

function MatchingDistributionPreview(props: {
  matches: RevisedMatch[] | undefined;
  isLoadingMatchingFunds: boolean;
  matchingFundsError: Error | undefined;
  shouldShowRevisedTable: boolean;
  round: Round;
  matchToken: TToken | undefined;
}) {
  return (
    <>
      <div className="flex mt-4 pt-6 mb-4">
        <p className="text-sm leading-5 text-gray-500 font-semibold text-left">
          Preview
        </p>
        {props.matches && (
          <span className="text-sm leading-5 text-violet-400 text-left ml-auto">
            ({props.matches.length}) Projects
          </span>
        )}
      </div>
      {props.isLoadingMatchingFunds ? (
        <Spinner text="We're fetching the matching data." />
      ) : (
        <div>
          {props.matchingFundsError && (
            <div className="p-4 bg-red-50 text-red-400 my-4">
              <div className="font-bold text-red-500 text-sm">
                Something went wrong while loading the matching distribution:
              </div>
              {props.matchingFundsError?.message}
            </div>
          )}
          {props.matches !== undefined ? (
            <>
              <div className="col-span-3 border border-gray-100 rounded p-4 row-span-2 overflow-y-auto max-h-80">
                <table
                  className="table-fixed border-separate h-full w-full"
                  data-testid="match-stats-table"
                >
                  <thead className="font-normal">
                    <tr>
                      <th className="text-sm leading-5 pr-2 text-gray-500 text-left">
                        Project Name
                      </th>
                      <th className="text-sm leading-5 px-2 text-gray-500 text-left w-40">
                        Project ID
                      </th>
                      <th className="text-sm leading-5 px-2 text-gray-500 text-left w-40">
                        No. of Contributions
                      </th>
                      <th className="text-sm leading-5 px-2 text-gray-500 text-left">
                        {props.shouldShowRevisedTable
                          ? "Original Matching Amount"
                          : "Matching Amount"}
                      </th>
                      {props.shouldShowRevisedTable && (
                        <th className="text-sm leading-5 px-2 text-gray-500 text-left">
                          New Matching Amount
                        </th>
                      )}
                      <th className="text-sm leading-5 px-2 text-gray-500 text-left w-32">
                        Matching %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {props.matches &&
                      props.matches.map((match) => {
                        const percentage =
                          Number(
                            (BigInt(1000000) * match.revisedMatch) /
                              props.round.matchAmount
                          ) / 10000;

                        return (
                          <tr key={match.applicationId}>
                            <td className="text-sm leading-5 py-2 pr-2 text-gray-400 text-left text-ellipsis overflow-hidden whitespace-nowrap">
                              {match.projectName}
                            </td>
                            <td className="text-sm leading-5 px-2 text-gray-400 text-left text-ellipsis overflow-hidden">
                              {match.projectId}
                            </td>
                            <td className="text-sm leading-5 px-2 text-gray-400 text-left">
                              {match.contributionsCount}
                            </td>
                            <td className="text-sm leading-5 px-2 text-gray-400 text-left">
                              {Number(
                                utils.formatUnits(
                                  match.matched,
                                  props.matchToken?.decimals
                                )
                              ).toFixed(4)}{" "}
                              {props.matchToken?.code}
                            </td>
                            {props.shouldShowRevisedTable && (
                              <td className="text-sm leading-5 px-2 text-gray-400 text-left">
                                {Number(
                                  utils.formatUnits(
                                    match.revisedMatch,
                                    props.matchToken?.decimals
                                  )
                                ).toFixed(4)}{" "}
                                {props.matchToken?.code}
                              </td>
                            )}
                            <td className="text-sm leading-5 px-2 text-gray-400 text-left">
                              {percentage.toString()}%
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 py-16 border border-gray-100 rounded overflow-y-auto max-h-80">
              <NoInformationIcon className="w-6 h-6" />
              <p className="mt-2">
                Your results will appear here when uploaded
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function DownloadMatchesAsCSV(props: { matches: RevisedMatch[] | undefined }) {
  return (
    <div className="flex flex-col mt-4 w-min">
      <button
        onClick={() => {
          /* Download matching distribution data as csv */
          if (!props.matches) {
            return;
          }

          downloadArrayAsCsv(props.matches, "matches.csv");
        }}
        className="bg-gray-100 hover:bg-gray-200 text-black font-bold py-2 px-4 rounded flex items-center gap-2"
      >
        <DownloadIcon className="h-5 w-5" /> CSV
      </button>
    </div>
  );
}

function RoundSaturationView(props: {
  roundSaturation: number;
  sumOfMatches: bigint;
  round: Round;
  matchToken: TToken;
}) {
  return (
    <div className="flex flex-col mt-4 gap-1 mb-3">
      <span className="text-sm leading-5 text-gray-500 font-semibold text-left mb-1">
        Round Saturation
      </span>
      <span className="text-sm leading-5 font-normal text-left">
        {`Current round saturation: ${props.roundSaturation.toFixed(2)}%`}
      </span>
      <span className="text-sm leading-5 font-normal text-left">
        {`${formatUnits(
          props.sumOfMatches,
          props.matchToken
        )} out of the ${formatUnits(
          props.round.matchAmount,
          props.matchToken
        )} matching fund will be distributed to grantees.`}
      </span>
    </div>
  );
}

function RoundSaturationOptions(props: {
  distributionOption: "keep" | "scale";
  setDistributionOption: (option: "keep" | "scale") => void;
  disableRoundSaturationControls: boolean;
}) {
  return (
    <>
      <RadioGroup
        value={props.distributionOption}
        onChange={props.setDistributionOption}
        disabled={props.disableRoundSaturationControls}
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
                classNames(
                  "cursor-pointer flex items-center",
                  props.disableRoundSaturationControls &&
                    "opacity-50 cursor-not-allowed"
                )
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
    </>
  );
}

function ReviseVotingCoefficients(props: {
  overridesFile: File | undefined;
  setOverridesFile: (file: File | undefined) => void;
  reloadMatchingFunds: () => void;
  matchingTableRef: React.RefObject<HTMLDivElement>;
  shouldShowRevisedTable: boolean;
}) {
  const [overridesFileDraft, setOverridesFileDraft] = useState<
    undefined | File
  >(undefined);
  return (
    <div className="flex flex-col mt-4">
      <span className="text-sm leading-5 text-gray-500 font-semibold text-left mb-1 mt-2">
        Revise Voting Coefficients
      </span>
      <div className="text-sm leading-5 text-left mb-1">
        Upload a CSV with the finalized Vote Coefficient overrides <b>only</b>.
        For instructions, click{" "}
        <a
          className="underline"
          target="_blank"
          href={
            "https://roundoperations.gitcoin.co/round-operations/post-round/sybil-analysis"
          }
        >
          here
        </a>
        .
      </div>
      <div className="text-sm pt-2 leading-5 text-left flex items-start justify-start">
        <ExclamationCircleIcon className={"w-6 h-6 text-gray-500 mr-2.5"} />
        If you navigate away from this page, your data will be lost. You will be
        able to re-upload data as much as you’d like, but it will not be saved
        to the contract until you finalize results.
      </div>
      <FileUploader
        file={overridesFileDraft}
        onSelectFile={(file: File) => {
          setOverridesFileDraft(file);
        }}
      />
      <div className="flex flex-row justify-items-start gap-2 items-center">
        <div>
          <Button
            type="button"
            className="mt-4 mr-auto"
            $variant="secondary"
            onClick={() => {
              props.setOverridesFile(overridesFileDraft);
              // force a refresh each time fot better ux
              props.reloadMatchingFunds();

              // make sure table is in view
              if (props.matchingTableRef.current) {
                window.scrollTo({
                  top: props.matchingTableRef.current.offsetTop,
                  behavior: "smooth",
                });
              }
            }}
            disabled={overridesFileDraft === undefined}
          >
            <UploadIcon className="h-5 w-5 inline mr-2" />
            <span>Upload and revise</span>
          </Button>
        </div>
        <div>
          {props.shouldShowRevisedTable && (
            <button
              onClick={() => {
                props.setOverridesFile(undefined);
                props.reloadMatchingFunds();
              }}
              className="w-fit bg-white border border-gray-100 text-black py-1 mt-3 px-3 rounded gap-2 ml-2"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadCustomResults(props: {
  customResultsFile: File | undefined;
  setCustomResultsFile: (file: File | undefined) => void;
  reloadMatchingFunds: () => void;
  shouldShowCustomResultsTable: boolean;
}) {
  const [customResultsDraft, setCustomResultsDraft] = useState<
    undefined | File
  >(undefined);
  return (
    <div className="flex flex-col mt-4">
      <span className="text-sm leading-5 text-gray-500 font-semibold text-left mb-1 mt-2">
        Upload Results
      </span>
      <div className="text-sm leading-5 text-left mb-1">
        Upload a CSV file with your round results. For instructions, click{" "}
        <a
          className="underline"
          target="_blank"
          href={
            "https://roundoperations.gitcoin.co/round-operations/post-round/cluster-matching-and-csv-upload"
          }
        >
          here
        </a>
        .
      </div>
      <div className="text-sm pt-2 leading-5 text-left flex items-start justify-start">
        <ExclamationCircleIcon className={"w-6 h-6 text-gray-500 mr-2.5"} />
        If you navigate away from this page, your data will be lost. You will be
        able to re-upload data as much as you’d like, but it will not be saved
        to the contract until you finalize results.
      </div>
      <FileUploader
        file={customResultsDraft}
        onSelectFile={(file: File) => {
          setCustomResultsDraft(file);
        }}
      />
      <div className="flex flex-row justify-items-start gap-2 items-center">
        <div>
          <Button
            type="button"
            className="mt-4 mr-auto"
            $variant="secondary"
            onClick={() => {
              props.setCustomResultsFile(customResultsDraft);
              // force a refresh each time fot better ux
              props.reloadMatchingFunds();
            }}
          >
            <UploadIcon className="h-5 w-5 inline mr-2" />
            <span>Upload</span>
          </Button>
        </div>
        <div>
          {props.shouldShowCustomResultsTable && (
            <button
              onClick={() => {
                props.setCustomResultsFile(undefined);
                props.reloadMatchingFunds();
              }}
              className="w-fit bg-white border border-gray-100 text-black py-1 mt-3 px-3 rounded gap-2 ml-2"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FinalizeResultsButton(props: {
  isReadyForPayout: boolean;
  isRoundFullyFunded: boolean;
  setWarningModalOpen: (open: boolean) => void;
}) {
  return (
    <div className="flex flex-col justify-items-end">
      <hr className="my-4" />
      <button
        data-testid="finalize-results-button"
        onClick={() => {
          props.setWarningModalOpen(true);
        }}
        className={`self-end w-fit ${"bg-violet-400"} text-white py-2 mt-2 px-3 rounded`}
      >
        Finalize Results
      </button>
      <span className="text-sm leading-5 text-gray-400 mt-5 text-right">
        The contract will be locked once results are finalized. You will not be
        able to change the results after you finalize.
      </span>
    </div>
  );
}

function ViewTransactionButton(props: {
  readyForPayoutTransactionHash: string | null;
}) {
  const { chain } = useAccount();
  return (
    <>
      <hr className="my-4 mt-8" />
      <a
        href={`${chain?.blockExplorers?.default.url}/tx/${props.readyForPayoutTransactionHash}`}
        target="_blank"
        className="self-end w-fit bg-white hover:bg-gray-50 border border-gray-100 text-gray-500 py-2
                   mt-2 px-3 rounded flex items-center gap-2 ml-auto"
      >
        View on Etherscan
      </a>
    </>
  );
}

function formatUnits(value: bigint, matchToken?: TToken) {
  return `${Number(utils.formatUnits(value, matchToken?.decimals)).toFixed(
    4
  )} ${matchToken?.code}`;
}
