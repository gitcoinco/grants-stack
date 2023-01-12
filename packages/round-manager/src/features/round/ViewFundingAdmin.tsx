import { Spinner } from "../common/Spinner";
import {
  ExclamationCircleIcon as NoInformationIcon,
  InformationCircleIcon,
} from "@heroicons/react/outline";
import {
  MatchingStatsData,
  ProgressStatus,
  ProgressStep,
  Round,
} from "../api/types";
import { useNavigate } from "react-router-dom";
import InfoModal from "../common/InfoModal";
import ProgressModal from "../common/ProgressModal";
import ErrorModal from "../common/ErrorModal";
import { useRoundMatchData } from "../api/api";
import { Button } from "../common/styles";
import { saveObjectAsJson } from "../api/utils";
import { RadioGroup } from "@headlessui/react";
import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { XIcon } from "@heroicons/react/outline";
import {
  useFinalizeRound,
  useMatchingDistribution,
} from "../../context/round/FinalizeRoundContext";
import { errorModalDelayMs } from "../../constants";

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
  const [useDefault, setUseDefault] = useState(true);
  const [customMatchingData, setCustomMatchingData] = useState<
    MatchingStatsData[] | undefined
  >();
  const [useContractData, setUseContractData] = useState(true);
  const [matchingDistributionContract, setMatchingDistributionContract] =
    useState<MatchingStatsData[] | undefined>();

  const { distributionMetaPtr, matchingDistribution, isLoading, isError } =
    useMatchingDistribution(props.roundId);

  useEffect(() => {
    if (distributionMetaPtr !== "") {
      setUseContractData(true);
      setMatchingDistributionContract(matchingDistribution);
    } else {
      setUseContractData(false);
      setMatchingDistributionContract(undefined);
    }
  }, [distributionMetaPtr, matchingDistribution]);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { data, error, loading } = useRoundMatchData(
    props.chainId,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    props.roundId!
  );
  const matchingData: MatchingStatsData[] | undefined = data?.map((data) => {
    const project = props.round?.approvedProjects?.filter(
      (project) =>
        project.projectRegistryId.toLowerCase() === data.projectId.toLowerCase()
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
        {(loading || isLoading) && (
          <Spinner text="We're fetching the matching data." />
        )}
        {(error || isError) && <ErrorMessage />}
      </div>
      {!error && !isError && !loading && !isLoading && (
        <FinalizeRound
          roundId={props.roundId}
          matchingData={matchingData}
          useDefault={useDefault}
          setUseDefault={setUseDefault}
          customMatchingData={customMatchingData}
          setCustomMatchingData={setCustomMatchingData}
          useContractData={useContractData}
          setUseContractData={setUseContractData}
          matchingDistributionContract={matchingDistributionContract}
        />
      )}
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
  useContractData?: boolean;
  matchingData: MatchingStatsData[] | undefined;
  isCustom?: boolean;
  customMatchingData?: MatchingStatsData[] | undefined;
  setCustomMatchingData?: (
    customMatchingStats: MatchingStatsData[] | undefined
  ) => void;
}) {
  return (
    <div className="mt-8">
      <hr className="mt-2 mb-4" />
      <div className="flex flex-row relative">
        <p className="font-bold" data-testid="match-stats-title">
          {props.useContractData
            ? "Finalized"
            : props.isCustom
            ? "Custom"
            : "Default"}{" "}
          Matching Stats
        </p>
        <p className="font-bold text-violet-400 absolute left-3/4 ml-24">
          ({props.matchingData?.length}) Projects
        </p>
        {props.isCustom && (
          <span
            className="absolute right-0 h-6 w-6 text-red-400"
            onClick={() =>
              props.setCustomMatchingData &&
              props.setCustomMatchingData(undefined)
            }
            data-testid="cancel-icon"
          >
            <XIcon />
          </span>
        )}
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
      {!props.isCustom ? (
        <div className="relative mt-4 mb-8 pb-8">
          <Button
            onClick={() => {
              if (props.matchingData) {
                saveObjectAsJson("matching_data.json", props.matchingData);
              }
            }}
            type="button"
            className="absolute right-0 bg-gray-200 hover:bg-gray-300 text-gray-900"
            data-testid="download-json"
          >
            {`${"</>"}  Download JSON`}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function FinalizeRound(props: {
  roundId: string | undefined;
  matchingData: MatchingStatsData[] | undefined;
  useDefault: boolean;
  setUseDefault: (useDefault: boolean) => void;
  customMatchingData: MatchingStatsData[] | undefined;
  setCustomMatchingData: (
    customMatchingStats: MatchingStatsData[] | undefined
  ) => void;
  useContractData: boolean;
  setUseContractData: (useContractData: boolean) => void;
  matchingDistributionContract: MatchingStatsData[] | undefined;
}) {
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [openProgressModal, setOpenProgressModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const navigate = useNavigate();

  const { finalizeRound, IPFSCurrentStatus, finalizeRoundToContractStatus } =
    useFinalizeRound();

  useEffect(() => {
    if (
      IPFSCurrentStatus === ProgressStatus.IS_SUCCESS &&
      finalizeRoundToContractStatus === ProgressStatus.IS_SUCCESS
    ) {
      // redirectToFinalizedRoundStats(navigate, 2000);
      console.log("success");
    }
  }, [navigate, IPFSCurrentStatus, finalizeRoundToContractStatus]);

  useEffect(() => {
    if (
      IPFSCurrentStatus === ProgressStatus.IS_ERROR ||
      finalizeRoundToContractStatus === ProgressStatus.IS_ERROR
    ) {
      setTimeout(() => {
        setOpenProgressModal(false);
        setOpenErrorModal(true);
      }, errorModalDelayMs);
    }
  }, [navigate, IPFSCurrentStatus, finalizeRoundToContractStatus]);

  const handleFinalizeRound = async () => {
    try {
      if (props.roundId !== undefined) {
        setOpenProgressModal(true);
        await finalizeRound(
          props.roundId,
          props.useDefault ? props.matchingData : props.customMatchingData
        );
      }
    } catch (error) {
      console.error("FinalizeRound", error);
    }
  };

  const progressSteps: ProgressStep[] = [
    {
      name: "Storing",
      description: "The distribution data is being saved in a safe place.",
      status: IPFSCurrentStatus,
    },
    {
      name: "Finalizing",
      description: `The distribution is being finalized in the contract.`,
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

  return (
    <>
      {props.useContractData && (
        <div className="w-full pt-12">
          <span className="font-bold">Finalized Round</span>
          <InformationTable
            useContractData={props.useContractData}
            matchingData={props.matchingDistributionContract}
          />
        </div>
      )}
      {!props.useContractData && (
        <div className="w-full pt-12">
          <span className="font-bold">Finalize Round</span>
          <hr className="mt-2 mb-4" />
          <div className="flex columns-2 pl-8">
            <div className="w-full pt-2">
              <form className="mt-4 space-y-3 w-full">
                <div className="w-full pt-2">
                  <CustomOrDefaultRadioGroup
                    useDefault={props.useDefault}
                    setUseDefault={props.setUseDefault}
                  />
                </div>
                <div>
                  {props.useDefault ? (
                    <InformationTable matchingData={props.matchingData} />
                  ) : null}
                  {!props.useDefault && !props.customMatchingData && (
                    <UploadJSON
                      matchingData={props.matchingData}
                      setCustomMatchingData={props.setCustomMatchingData}
                    />
                  )}
                  {!props.useDefault && props.customMatchingData ? (
                    <InformationTable
                      matchingData={props.customMatchingData}
                      isCustom={true}
                      customMatchingData={props.customMatchingData}
                      setCustomMatchingData={props.setCustomMatchingData}
                    />
                  ) : null}
                </div>
                <div className="grid justify-items-end">
                  <div className="w-fit">
                    <Button
                      onClick={() => setOpenInfoModal(true)}
                      type="submit"
                      className="my-5 w-full flex justify-center tracking-wide focus:outline-none focus:shadow-outline shadow-lg cursor-pointer"
                      disabled={!props.useDefault && !props.customMatchingData}
                    >
                      Finalize and save to contract
                    </Button>
                  </div>
                </div>
              </form>
            </div>
            <InfoModal
              title={"Heads up!"}
              body={<InfoModalBody />}
              isOpen={openInfoModal}
              setIsOpen={setOpenInfoModal}
              continueButtonAction={handleFinalizeRound}
            />
            <ProgressModal
              isOpen={openProgressModal}
              subheading={"Please hold while we update the contract."}
              steps={progressSteps}
            />
            <ErrorModal
              isOpen={openErrorModal}
              setIsOpen={setOpenErrorModal}
              tryAgainFn={handleFinalizeRound}
            />
          </div>
        </div>
      )}
    </>
  );
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function UploadJSON(props: {
  matchingData: MatchingStatsData[] | undefined;
  setCustomMatchingData: (
    customMatchingStats: MatchingStatsData[] | undefined
  ) => void;
}) {
  const [projectIDMismatch, setProjectIDMismatch] = useState(false);
  const [matchingPerecentMismatch, setMatchingPerecentMismatch] =
    useState(false);

  const projectIDs = props.matchingData?.map((data) => data.projectId);

  const matchingDataSchema = yup.array().of(
    yup.object().shape({
      projectName: yup.string().required(),
      projectId: yup.string().required(),
      uniqueContributorsCount: yup.number().required(),
      matchPoolPercentage: yup.number().required(),
    })
  );

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const fileList = event.dataTransfer.files;
    fileList[0].arrayBuffer().then((buffer) => {
      const decoder = new TextDecoder("utf-8");
      const jsonString = decoder.decode(buffer);
      const jsonData = JSON.parse(jsonString);
      try {
        matchingDataSchema.validateSync(jsonData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const jsonProjectIDs = jsonData.map((data: any) => data.projectId);
        const jsonMatchPoolPercentages = jsonData.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data: any) => data.matchPoolPercentage
        );
        const idMismatch = !projectIDs?.every((projectID) =>
          jsonProjectIDs.includes(projectID)
        );
        const matchPoolPercentageMismatch = !(
          Number(
            jsonMatchPoolPercentages
              ?.reduce(
                (accumulator: number, currentValue: number) =>
                  accumulator + currentValue,
                0
              )
              .toFixed(4)
          ) === 1
        );
        setProjectIDMismatch(idMismatch);
        setMatchingPerecentMismatch(matchPoolPercentageMismatch);
        !idMismatch &&
          !matchPoolPercentageMismatch &&
          props.setCustomMatchingData(jsonData);
      } catch (error) {
        props.setCustomMatchingData(undefined);
      }
    });
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    const fileList = event.target.files;
    if (fileList) {
      fileList[0].arrayBuffer().then((buffer) => {
        const decoder = new TextDecoder("utf-8");
        const jsonString = decoder.decode(buffer);
        const jsonData = JSON.parse(jsonString);
        try {
          matchingDataSchema.validateSync(jsonData);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const jsonProjectIDs = jsonData.map((data: any) => data.projectId);
          const jsonMatchPoolPercentages = jsonData.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (data: any) => data.matchPoolPercentage
          );
          const idMismatch = !projectIDs?.every((projectID) =>
            jsonProjectIDs.includes(projectID)
          );
          const matchPoolPercentageMismatch = !(
            Number(
              jsonMatchPoolPercentages
                ?.reduce(
                  (accumulator: number, currentValue: number) =>
                    accumulator + currentValue,
                  0
                )
                .toFixed(4)
            ) === 1
          );
          setProjectIDMismatch(idMismatch);
          setMatchingPerecentMismatch(matchPoolPercentageMismatch);
          !idMismatch &&
            !matchPoolPercentageMismatch &&
            props.setCustomMatchingData(jsonData);
        } catch (error) {
          props.setCustomMatchingData(undefined);
        }
      });
    }
  };
  return (
    <div className="w-full pt-2 mt-8 flex flex-col justify-center items-center">
      <div
        className="flex items-center justify-center w-2/4 mt-4"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleFileDrop}
        data-testid="dropzone"
      >
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
                <a className="text-purple-600 hover:underline">Upload a file</a>{" "}
                or drag and drop
              </span>
              <br />
              matching JSON
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            id="file-input"
            onChange={handleFileInputChange}
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

function CustomOrDefaultRadioGroup(props: {
  useDefault: boolean;
  setUseDefault: (value: boolean) => void;
}) {
  return (
    <RadioGroup
      value={props.useDefault}
      onChange={props.setUseDefault}
      data-testid="custom-or-default-test-id"
    >
      <RadioGroup.Label>
        Use default finalized matching stats or upload your own?
      </RadioGroup.Label>
      <div>
        <RadioGroup.Option value={true} data-testid="default-radio-test-id">
          {({ checked, active }) => (
            <span className="flex items-center text-sm pt-4">
              <span
                className={classNames(
                  checked
                    ? "bg-indigo-600 border-transparent"
                    : "bg-white border-gray-300",
                  active ? "ring-2 ring-offset-2 ring-indigo-500" : "",
                  "h-4 w-4 rounded-full border flex items-center justify-center"
                )}
                aria-hidden="true"
              >
                <span className="rounded-full bg-white w-1.5 h-1.5" />
              </span>
              <RadioGroup.Label
                as="span"
                className="ml-3 block text-sm text-gray-700"
              >
                Use Default
              </RadioGroup.Label>
            </span>
          )}
        </RadioGroup.Option>
        <RadioGroup.Option value={false} data-testid="custom-radio-test-id">
          {({ checked, active }) => (
            <span className="flex items-center text-sm pt-4">
              <span
                className={classNames(
                  checked
                    ? "bg-indigo-600 border-transparent"
                    : "bg-white border-gray-300",
                  active ? "ring-2 ring-offset-2 ring-indigo-500" : "",
                  "h-4 w-4 rounded-full border flex items-center justify-center"
                )}
                aria-hidden="true"
              >
                <span className="rounded-full bg-white w-1.5 h-1.5" />
              </span>
              <RadioGroup.Label
                as="span"
                className="ml-3 block text-sm text-gray-700"
              >
                Upload my own JSON
              </RadioGroup.Label>
            </span>
          )}
        </RadioGroup.Option>
      </div>
    </RadioGroup>
  );
}

function InfoModalBody() {
  return (
    <div className="text-sm text-grey-400 gap-16">
      <p className="text-sm">
        You have only one chance to finalize distribution for your round.
        <br />
        Please make sure that the final distribution is correct.
        <br />
        You will not be able to make changes after finalizing.
      </p>
    </div>
  );
}
