import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { utils } from "ethers";
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
import { Match } from "allo-indexer-client";
import { Spinner } from "../../common/Spinner";
import { useFileUpload } from "../../../hooks";

// CHECK: should this be in common?
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
  const { id } = useParams();
  const roundId = utils.getAddress(id?.toLowerCase() ?? "");
  // eslint-disable-next-line prefer-const
  let { data: matches, isLoading } = useRoundMatchingFunds(roundId);
  const debugModeEnabled = useDebugMode();
  const { data: round } = useRound(roundId);
  const { uploadedData, uploadedFilename, onDrop, error } = useFileUpload();

  const [distributionOption, setDistributionOption] = useState("keep");
  const [currentRoundSaturation, setCurrentRoundSaturation] = useState(0);
  const [isSaturated, setIsSaturated] = useState(true);
  const [revisedMatches, setRevisedMatches] = useState<any>(null);

  useEffect(() => {
    if (distributionOption === "scale" && !isSaturated && matches) {
      const scaleFactor = 1 / currentRoundSaturation;
      const newMatches = matches.map((match) => {
        return {
          ...match,
          revisedMatched: match.matched * scaleFactor,
        };
      });
      setRevisedMatches(newMatches);
    } else {
      setRevisedMatches(null);
    }
  }, [currentRoundSaturation, distributionOption, isSaturated, matches]); 

  useEffect(() => {
    if (matches && round) {
      console.log(round)
      console.log(matches)
      const matchTotal = matches.reduce(
        (acc: number, match: Match) => acc + match?.matched,
        0
      );
      const saturation = matchTotal / Number(utils.formatEther(round.matchAmount));
      setCurrentRoundSaturation(saturation);
      setIsSaturated(saturation >= 1);
    }
  }, [round, matches, isLoading]); 

  useEffect(() => {
    onRecalculateResults();
  }, [distributionOption])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  const onRecalculateResults = () => {
    // Logic for recalculating results goes here
    // DEBUG: timeout for testing
    isLoading = true;
    setTimeout(() => {
      console.log("Recalculating results...");
      isLoading = false;
    }
    , 1000);
  };

  const onFinalizeResults = () => {
    // Logic for finalizing results goes here
  };

  const matchAmountUSD = round?.matchAmountUSD;

  const currentTime = new Date();
  const isBeforeRoundEndDate = round && currentTime < round.roundEndTime;

  if (isBeforeRoundEndDate && !debugModeEnabled) {
    return <NoInformationContent />;
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
                <button className="bg-gray-100 hover:bg-gray-200 text-black font-bold py-2 px-4 rounded flex items-center gap-2">
                  <DownloadIcon className="h-5 w-5" />
                  CSV
                </button>
              </div>
              <div
                className="flex flex-col mt-4"
                data-testid="match-stats-title"
              >
                <span className="text-sm leading-5 text-gray-500 font-semibold text-left mb-1 mt-2">
                  Matching Distribution
                </span>
              </div>

              <div className="overflow-y-auto max-h-54">
              {
                isLoading ? <Spinner text=""/> :
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
                          Est. Match Amount
                        </th>
                        <th className="text-sm leading-5 text-gray-400 text-left">
                          Est. Matching %
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {matches &&
                      matches.map((match: Match) => {
                        return (
                          <tr key={match.applicationId}>
                            <td className="text-sm leading-5 text-gray-400 text-left">
                              {match.projectName}
                            </td>
                            <td className="text-sm leading-5 text-gray-400 text-left">
                              {match.contributionsCount}
                            </td>
                            <td className="text-sm leading-5 text-gray-400 text-left">
                              {match.matched?.toFixed(4)}
                            </td>
                            <td className="text-sm leading-5 text-gray-400 text-left">
                              {
                                matchAmountUSD &&
                                ((match.matched / matchAmountUSD) * 100).toFixed(4)
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                }
              </div>
              <div className="flex flex-col mt-4 w-min">
                <button className="bg-gray-100 hover:bg-gray-200 text-black font-bold py-2 px-4 rounded flex items-center gap-2">
                  <DownloadIcon className="h-5 w-5" />{" "}
                  {/* Add the ArrowNarrowDown icon */}
                  CSV
                </button>
              </div>
              <div className="flex flex-col mt-4 gap-1 mb-3">
                <span className="text-sm leading-5 text-gray-500 font-semibold text-left mb-1">
                  Round Saturation
                  </span>
                <span className="text-sm leading-5 font-normal text-left">
                  {`Current round saturation: ${currentRoundSaturation > 1.0 ? 100 : currentRoundSaturation * 100}%`}
                </span>
                <span className="text-sm leading-5 font-normal text-left">
                  {`$${0} out of the $${round?.matchAmountUSD} matching fund will be distributed to grantees.`}
                </span>
              </div>
              <RadioGroup
                value={distributionOption}
                onChange={setDistributionOption}
                disabled={isSaturated}
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
                            className={classNames(
                              "text-indigo-600 focus:ring-indigo-500",
                              isSaturated && "opacity-50"
                            )}
                            checked={checked}
                            readOnly
                          />
                          <span
                            className={classNames(
                              "ml-2 font-medium",
                              isSaturated && "opacity-50"
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
                  matchingData={revisedMatches}
                  setCustomMatchingData={setRevisedMatches}
                  filename={uploadedFilename}
                />
                <button
                  onClick={onRecalculateResults}
                  className="w-fit bg-violet-100 hover:bg-violet-200 text-violet-400 font-medium py-2 px-4 mt-4 rounded flex items-center gap-2"
                >
                  <RefreshIcon className="h-5 w-5" />
                  Recalculate results
                </button>
                <hr className="my-4" />
                <button
                  onClick={onFinalizeResults}
                  className="self-end w-fit bg-white hover:bg-pink-200 border border-pink-400 text-pink-400 py-2
                   mt-2 px-3 rounded flex items-center gap-2"
                >
                  Finalize results
                </button>
                <span className="text-sm leading-5 text-gray-400 mt-5 text-center">
                  The contract will be locked once results are finalized. You
                  will not be able to change the results after you finalize.
                </span>
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <div>{/* raw round data content here */}</div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

interface UploadJSONProps {
  rootProps: DropzoneRootProps;
  inputProps: DropzoneInputProps;
  matchingData: any;
  setCustomMatchingData: (data: any) => void;
  filename: string | null; // Add this line
}

export function UploadJSON({
  rootProps,
  inputProps,
  filename, 
}: UploadJSONProps) {
  const [projectIDMismatch, setProjectIDMismatch] = useState(false);
  const [matchingPercentMismatch, setMatchingPercentMismatch] = useState(false);
  return (
    <div className="pt-2 flex flex-col items-start" {...rootProps}>
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
            {...inputProps}
          />
          {filename && <div className="text-sm text-gray-400 mb-1">Uploaded file: {filename}</div>}
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
      {matchingPercentMismatch && (
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

