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
import { classNames } from "common";
import { Button } from "common/src/styles";
import { useDebugMode, useRoundMatchingFunds } from "../../../hooks";
import {
  GrantApplication,
  ProgressStatus,
  ProgressStep,
  Round,
} from "../../api/types";
import { LoadingRing, Spinner } from "../../common/Spinner";
import { stringify } from "csv-stringify/sync";
import { Input } from "csv-stringify/lib";
import { useNetwork, useSigner } from "wagmi";
import InfoModal from "../../common/InfoModal";
import ProgressModal from "../../common/ProgressModal";
import ErrorModal from "../../common/ErrorModal";
import { useFinalizeRound } from "../../../context/round/FinalizeRoundContext";
import { errorModalDelayMs } from "../../../constants";
import { useRoundById } from "../../../context/round/RoundContext";
import { roundApplicationsToCSV } from "../../api/exports";
import { PayoutToken, payoutTokens } from "../../api/payoutTokens";
import { DistributionMatch } from "data-layer";
import { utils } from "ethers";
import { useContractAmountFunded } from "../FundContract";
import { useApplicationsByRoundId } from "../../common/useApplicationsByRoundId";

type RevisedMatch = {
  revisedContributionCount: number;
  revisedMatch: bigint;
  matched: bigint;
  contributionsCount: number;
  projectId: string;
  applicationId: string;
  projectName: string;
  payoutAddress: string;
};

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
  const { id } = useParams();

  if (id === undefined) {
    return <div>Invalid round ID</div>;
  }

  return <ViewRoundResultsWithId id={id} />;
}

function ViewRoundResultsWithId({ id }: { id: string }) {
  const round = useRoundById(id.toLowerCase());
  const applications = useApplicationsByRoundId(id.toLowerCase());
  const chainId = round?.round?.chainId;

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

  const matchToken = payoutTokens.find(
    (t) =>
      t.address.toLowerCase() == matchTokenAddress.toLowerCase() &&
      t.chainId == chainId
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
  matchToken: PayoutToken;
}) {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const debugModeEnabled = useDebugMode();
  const network = useNetwork();
  const navigate = useNavigate();

  const matchingTableRef = useRef<HTMLDivElement>(null);
  const [overridesFileDraft, setOverridesFileDraft] = useState<
    undefined | File
  >(undefined);
  const [overridesFile, setOverridesFile] = useState<undefined | File>();

  const [distributionOption, setDistributionOption] = useState<
    "keep" | "scale"
  >("keep");

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

  const { data: amountFunded } = useContractAmountFunded({
    round: round,
    payoutToken: matchToken,
  });

  const isRoundFullyFunded =
    (amountFunded?.fundedAmount ?? 0) >= round.matchAmount;

  const [isExportingApplicationsCSV, setIsExportingApplicationsCSV] =
    useState(false);

  function formatUnits(value: bigint) {
    return `${Number(utils.formatUnits(value, matchToken?.decimal)).toFixed(
      4
    )} ${matchToken?.name}`;
  }

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
    if (!matches || !signer) {
      return;
    }

    setWarningModalOpen(false);
    setProgressModalOpen(true);
    try {
      const matchingJson: DistributionMatch[] = matches.map((match) => {
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
                  href={`${process.env.REACT_APP_ALLO_API_URL}/api/v1/chains/${chain?.id}/rounds/${roundId}/exports/vote_coefficients`}
                  className="bg-gray-100 hover:bg-gray-200 text-black font-bold py-2 px-4 rounded flex items-center gap-2"
                >
                  <DownloadIcon className="h-5 w-5" />
                  CSV
                </a>
              </div>
              <div
                className="flex mt-6 pt-6 mb-4 border-t border-gray-100"
                data-testid="match-stats-title"
                ref={matchingTableRef}
              >
                <span className="text-sm leading-5 text-gray-500 font-semibold text-left">
                  {areMatchingFundsRevised
                    ? "Revised Matching Distribution"
                    : "Matching Distribution"}
                </span>
                <span className="text-sm leading-5 text-gray-300 text-left ml-2">
                  Preview
                </span>
                {matches && (
                  <span className="text-sm leading-5 text-violet-400 text-left ml-auto">
                    ({matches.length}) Projects
                  </span>
                )}
              </div>
              {isLoadingMatchingFunds ? (
                <Spinner text="We're fetching the matching data." />
              ) : (
                <div>
                  {matchingFundsError && (
                    <div className="p-4 bg-red-50 text-red-400 my-4">
                      <div className="font-bold text-red-500 text-sm">
                        Something went wrong while loading the matching
                        distribution:
                      </div>
                      {matchingFundsError?.message}
                    </div>
                  )}
                  {matches && (
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
                                {shouldShowRevisedTable
                                  ? "Original Matching Amount"
                                  : "Matching Amount"}
                              </th>
                              {shouldShowRevisedTable && (
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
                            {matches &&
                              matches.map((match) => {
                                const percentage =
                                  Number(
                                    (BigInt(1000000) * match.revisedMatch) /
                                      round.matchAmount
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
                                          matchToken?.decimal
                                        )
                                      ).toFixed(4)}{" "}
                                      {matchToken?.name}
                                    </td>
                                    {shouldShowRevisedTable && (
                                      <td className="text-sm leading-5 px-2 text-gray-400 text-left">
                                        {Number(
                                          utils.formatUnits(
                                            match.revisedMatch,
                                            matchToken?.decimal
                                          )
                                        ).toFixed(4)}{" "}
                                        {matchToken?.name}
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
                    </>
                  )}
                </div>
              )}
              <div className="flex flex-col mt-4 gap-1 mb-3">
                <span className="text-sm leading-5 text-gray-500 font-semibold text-left mb-1">
                  Round Saturation
                </span>
                <span className="text-sm leading-5 font-normal text-left">
                  {`Current round saturation: ${roundSaturation.toFixed(2)}%`}
                </span>
                <span className="text-sm leading-5 font-normal text-left">
                  {`${formatUnits(sumOfMatches)} out of the ${formatUnits(
                    round.matchAmount
                  )} matching fund will be distributed to grantees.`}
                </span>
              </div>
              {!readyForPayoutTransactionHash && (
                <>
                  <RadioGroup
                    value={distributionOption}
                    onChange={setDistributionOption}
                    disabled={disableRoundSaturationControls}
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
                              disableRoundSaturationControls &&
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
                  <div className="flex flex-col mt-4">
                    <span className="text-sm leading-5 text-gray-500 font-semibold text-left mb-1 mt-2">
                      Revise Results
                    </span>
                    <div className="text-sm leading-5 text-left mb-1">
                      Upload a CSV with the finalized Vote Coefficient overrides{" "}
                      <b>only</b>. For instructions, click{" "}
                      <a
                        className="underline"
                        href={
                          "https://support.gitcoin.co/gitcoin-knowledge-base/gitcoin-grants-program/program-managers/how-to-view-your-round-results"
                        }
                      >
                        here
                      </a>
                      .
                    </div>
                    <div className="text-sm pt-2 leading-5 text-left flex items-start justify-start">
                      <ExclamationCircleIcon
                        className={"w-6 h-6 text-gray-500 mr-2.5"}
                      />
                      If you navigate away from this page, your data will be
                      lost. You will be able to re-upload data as much as you’d
                      like, but it will not be saved to the contract until you
                      finalize results.
                    </div>
                    <FileUploader
                      file={overridesFileDraft}
                      onSelectFile={(file: File) => {
                        setOverridesFileDraft(file);
                      }}
                    />
                    <Button
                      type="button"
                      className="mt-4 mr-auto"
                      $variant="secondary"
                      onClick={() => {
                        setOverridesFile(overridesFileDraft);
                        // force a refresh each time fot better ux
                        reloadMatchingFunds();

                        // make sure table is in view
                        if (matchingTableRef.current) {
                          window.scrollTo({
                            top: matchingTableRef.current.offsetTop,
                            behavior: "smooth",
                          });
                        }
                      }}
                      disabled={overridesFileDraft === undefined}
                    >
                      <UploadIcon className="h-5 w-5 inline mr-2" />
                      <span>Upload and revise</span>
                    </Button>
                    <hr className="my-4" />
                    {!isReadyForPayout && (
                      <>
                        <div className="ml-auto">
                          {shouldShowRevisedTable && (
                            <button
                              onClick={() => {
                                setOverridesFile(undefined);
                                reloadMatchingFunds();
                              }}
                              className="w-fit bg-white border border-gray-100 text-black py-2 mt-2 px-3 rounded gap-2 mr-2"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            data-testid="finalize-results-button"
                            onClick={() => {
                              setWarningModalOpen(true);
                            }}
                            disabled={!isRoundFullyFunded}
                            className={`self-end w-fit ${
                              isRoundFullyFunded
                                ? "bg-violet-400"
                                : "bg-violet-200"
                            } text-white py-2 mt-2 px-3 rounded`}
                          >
                            Finalize Results
                          </button>
                        </div>
                        <span className="text-sm leading-5 text-gray-400 mt-5 text-right">
                          The contract will be locked once results are
                          finalized. You will not be able to change the results
                          after you finalize.
                        </span>
                      </>
                    )}
                  </div>
                </>
              )}
              {readyForPayoutTransactionHash && (
                <>
                  <hr className="my-4 mt-8" />
                  <a
                    href={`${network.chain?.blockExplorers?.default.url}/tx/${readyForPayoutTransactionHash}`}
                    target="_blank"
                    className="self-end w-fit bg-white hover:bg-gray-50 border border-gray-100 text-gray-500 py-2
                   mt-2 px-3 rounded flex items-center gap-2 ml-auto"
                  >
                    View on Etherscan
                  </a>
                </>
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
                href={`${process.env.REACT_APP_ALLO_API_URL}/api/v1/chains/${chain?.id}/rounds/${roundId}/exports/votes`}
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
                href={`${process.env.REACT_APP_ALLO_API_URL}/api/v1/chains/${chain?.id}/rounds/${roundId}/exports/round`}
              >
                <span className="w-40">Round</span>
                <DownloadIcon className="h-5 w-5" />
              </a>
              <a
                className="flex items-center mb-4"
                href={`${process.env.REACT_APP_ALLO_API_URL}/api/v1/chains/${chain?.id}/rounds/${roundId}/exports/prices`}
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
