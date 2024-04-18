/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ArrowNarrowLeftIcon,
  CheckIcon,
  ShieldCheckIcon,
  XCircleIcon,
  XIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
} from "@heroicons/react/solid";

import { useEffect, useState } from "react";
import {
  Link,
  NavigateFunction,
  useNavigate,
  useParams,
} from "react-router-dom";
import ConfirmationModal from "../common/ConfirmationModal";
import Navbar from "../common/Navbar";
import { useWallet } from "../common/Auth";
import { Button } from "common/src/styles";
import { ReactComponent as TwitterIcon } from "../../assets/twitter-logo.svg";
import { ReactComponent as GithubIcon } from "../../assets/github-logo.svg";
import CheckmarkWhite from "../../assets/checkmark-white.svg";
import Rejected from "../../assets/rejected.svg";
import Footer from "common/src/components/Footer";
import { datadogLogs } from "@datadog/browser-logs";
import { useBulkUpdateGrantApplications } from "../../context/application/BulkUpdateGrantApplicationContext";
import ProgressModal from "../common/ProgressModal";
import {
  AnswerBlock,
  ApplicationStatus,
  GrantApplication,
  ProgressStatus,
  ProgressStep,
  ProjectCredentials,
  ProjectStatus,
} from "../api/types";
import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { Lit } from "../api/lit";
import { utils } from "ethers";
import NotFoundPage from "../common/NotFoundPage";
import AccessDenied from "../common/AccessDenied";
import { Spinner } from "../common/Spinner";
import { ApplicationBanner, ApplicationLogo } from "./BulkApplicationCommon";
import { useRoundById } from "../../context/round/RoundContext";
import ErrorModal from "../common/ErrorModal";
import { errorModalDelayMs } from "../../constants";
import {
  RoundName,
  ViewGrantsExplorerButton,
  ApplicationOpenDateRange,
  RoundOpenDateRange,
  RoundBadgeStatus,
} from "./ViewRoundPage";

import {
  CalendarIcon,
  formatDateWithOrdinal,
  getRoundStrategyType,
  getUTCTime,
  useAllo,
  VerifiedCredentialState,
} from "common";
import { renderToHTML, PassportVerifierWithExpiration } from "common";
import { useDebugMode } from "../../hooks";
import { getPayoutRoundDescription } from "../common/Utils";
import moment from "moment";
import ApplicationDirectPayout from "./ApplicationDirectPayout";
import { useApplicationsByRoundId } from "../common/useApplicationsByRoundId";
import { getAddress } from "ethers/lib/utils.js";
import { getAlloAddress } from "common/dist/allo/backends/allo-v2";

type Status = "done" | "current" | "rejected" | "approved" | undefined;

export const IAM_SERVER =
  "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC";

const verifier = new PassportVerifierWithExpiration();

function getApplicationStatusTitle(status: ProjectStatus) {
  switch (status) {
    case "IN_REVIEW":
      return "In review";
    default:
      // capital case
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }
}

export default function ViewApplicationPage() {
  const navigate = useNavigate();
  datadogLogs.logger.info("====> Route: /round/:roundId/application/:id");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const [reviewDecision, setReviewDecision] = useState<
    ApplicationStatus | undefined
  >(undefined);

  const [openModal, setOpenModal] = useState(false);
  const [openProgressModal, setOpenProgressModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);

  const [verifiedProviders, setVerifiedProviders] = useState<{
    [key: string]: VerifiedCredentialState;
  }>({
    github: VerifiedCredentialState.PENDING,
    twitter: VerifiedCredentialState.PENDING,
  });

  const { roundId, id } = useParams() as { roundId: string; id: string };
  const { chain, address } = useWallet();

  const { data: applications, isLoading } = useApplicationsByRoundId(roundId!);
  const filteredApplication = applications?.filter((a) => a.id == id) || [];
  const application = filteredApplication[0];

  const {
    bulkUpdateGrantApplications,
    contractUpdatingStatus,
    indexingStatus,
  } = useBulkUpdateGrantApplications();

  const isUpdateLoading =
    contractUpdatingStatus == ProgressStatus.IN_PROGRESS ||
    indexingStatus == ProgressStatus.IN_PROGRESS;

  const progressSteps: ProgressStep[] = [
    {
      name: "Updating",
      description: `Updating the application status on the contract.`,
      status: contractUpdatingStatus,
    },
    {
      name: "Indexing",
      description: "Indexing the data.",
      status: indexingStatus,
    },
    {
      name: "Redirecting",
      description: "Just another moment while we finish things up.",
      status:
        indexingStatus === ProgressStatus.IS_SUCCESS
          ? ProgressStatus.IN_PROGRESS
          : ProgressStatus.NOT_STARTED,
    },
  ];

  useEffect(() => {
    if (contractUpdatingStatus === ProgressStatus.IS_ERROR) {
      setTimeout(() => {
        setOpenProgressModal(false);
        setOpenErrorModal(true);
      }, errorModalDelayMs);
    }

    if (indexingStatus === ProgressStatus.IS_ERROR) {
      redirectToViewApplicationPage(navigate, 5000, roundId, id);
    } else if (indexingStatus == ProgressStatus.IS_SUCCESS) {
      redirectToViewRoundPage(navigate, 0, roundId);
    }
  }, [navigate, contractUpdatingStatus, indexingStatus, id, roundId]);

  useEffect(() => {
    const applicationHasLoadedWithProjectOwners =
      !isLoading && application?.project?.owners;
    if (applicationHasLoadedWithProjectOwners) {
      const credentials: ProjectCredentials =
        application?.project?.credentials ?? {};

      if (!credentials) {
        return;
      }
      const verify = async () => {
        const newVerifiedProviders: { [key: string]: VerifiedCredentialState } =
          { ...verifiedProviders };
        for (const provider of Object.keys(verifiedProviders)) {
          const verifiableCredential = credentials[provider];
          if (verifiableCredential) {
            newVerifiedProviders[provider] = await isVerified(
              verifiableCredential,
              verifier,
              provider,
              application
            );
          }
        }

        setVerifiedProviders(newVerifiedProviders);
      };
      verify();
    }
  }, [application, application?.project?.owners, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const { round } = useRoundById(roundId);
  const allo = useAllo();

  const handleReview = async () => {
    if (
      reviewDecision === undefined ||
      applications === undefined ||
      applications[0]?.payoutStrategy?.strategyName === undefined ||
      applications[0]?.payoutStrategy?.id === undefined
    ) {
      return;
    }

    try {
      if (!application) {
        throw "error: application does not exist";
      }

      if (allo === null) {
        throw "wallet not connected";
      }

      setOpenProgressModal(true);
      setOpenModal(false);

      if (reviewDecision == "IN_REVIEW") {
        application.inReview = true;
      } else {
        application.status = reviewDecision;
        application.inReview = false;
      }

      await bulkUpdateGrantApplications({
        roundId: roundId,
        allo,
        applications: applications,
        roundStrategyAddress: applications[0].payoutStrategy.id,
        roundStrategy: getRoundStrategyType(
          applications[0].payoutStrategy.strategyName
        ),
        selectedApplications: [application],
      });
    } catch (error) {
      datadogLogs.logger.error(
        `error: handleReview - ${error}, roundId - ${roundId}`
      );
      console.error("handleReview", error);
    }
  };

  const confirmReviewDecision = (status: ApplicationStatus) => {
    setReviewDecision(status);
    setOpenModal(true);
  };

  const getVerifiableCredentialVerificationResultView = (provider: string) => {
    switch (verifiedProviders[provider]) {
      case VerifiedCredentialState.VALID:
        return (
          <span className="rounded-full bg-teal-100 px-3 inline-flex flex-row justify-center items-center">
            <ShieldCheckIcon
              className="w-5 h-5 text-teal-500 mr-2"
              data-testid={`${provider}-verifiable-credential`}
            />
            <p className="text-teal-500 font-medium text-xs">Verified</p>
          </span>
        );
      case VerifiedCredentialState.INVALID:
        return (
          <span className="rounded-full bg-red-100 px-3 inline-flex flex-row justify-center items-center">
            <XCircleIcon
              className="w-5 h-5 text-white mr-2"
              data-testid={`${provider}-verifiable-credential-unverified`}
            />
            <p className="text-white font-medium text-xs">Invalid</p>
          </span>
        );
      default:
        return <></>;
    }
  };

  const [applicationExists, setApplicationExists] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);
  const debugModeEnabled = useDebugMode();

  useEffect(() => {
    if (!isLoading) {
      setApplicationExists(!!application);

      /* In debug mode, give frontend access to all rounds */
      if (debugModeEnabled) {
        setHasAccess(true);
        return;
      }

      if (round) {
        setHasAccess(!!round.operatorWallets?.includes(address?.toLowerCase()));
      }
    }
  }, [address, application, isLoading, round, debugModeEnabled]);

  const [answerBlocks, setAnswerBlocks] = useState<AnswerBlock[]>();
  useEffect(() => {
    if (!round || !applications) {
      return;
    }

    // Iterate through application answers and decrypt PII information
    const decryptAnswers = async () => {
      const _answerBlocks: AnswerBlock[] = [];

      const PREFIX = "data:application/octet-stream;base64";

      if (application?.answers && application.answers.length > 0) {
        for (let _answerBlock of application.answers) {
          if (_answerBlock.encryptedAnswer) {
            try {
              const encryptedAnswer = _answerBlock.encryptedAnswer;
              const base64EncryptedString = [
                PREFIX,
                encryptedAnswer.ciphertext,
              ].join(",");

              const response = await fetch(base64EncryptedString);
              const encryptedString: Blob = await response.blob();

              const lit = new Lit({
                chainId: chain.id,
                contract: roundId.startsWith("0x")
                  ? roundId
                  : round?.payoutStrategy.id ?? "",
              });

              const decryptedString = await lit.decryptString(
                encryptedString,
                encryptedAnswer.encryptedSymmetricKey
              );

              _answerBlock = {
                ..._answerBlock,
                answer: decryptedString,
              };
            } catch (error) {
              datadogLogs.logger.error(`error: decryptAnswers - ${error}`);
              console.error("decryptAnswers", error);

              _answerBlock = {
                ..._answerBlock,
                answer: "N/A",
              };
            }
          }

          _answerBlocks.push(_answerBlock);
        }
      }
      setAnswerBlocks(_answerBlocks);
    };

    if (!isLoading && hasAccess) {
      decryptAnswers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application, round, hasAccess, isLoading]);

  // Handle case where project github is not set but user github is set. if both are not available, set to null
  const registeredGithub =
    application?.project?.projectGithub ?? application?.project?.userGithub;

  const StepStatus: React.FC<{
    status?: Status;
    index?: number;
  }> = ({ status, index }) => {
    return (
      <div className="relative">
        <div
          className={`flex items-center justify-center rounded-full w-[24px] h-[24px] border-[2px] z-10 relative bg-white
        ${
          status === "done" || status === "approved"
            ? "bg-teal-500 border-teal-500"
            : status === "current"
            ? "border-violet-500"
            : status === "rejected"
            ? "bg-red-500 border-red-500"
            : ""
        }
        `}
        >
          {status === "done" && (
            <img
              src={CheckmarkWhite}
              className="h-3 w-3"
              alt=""
              data-testid="status-done"
            />
          )}
          {status === "rejected" && (
            <img
              src={Rejected}
              className="h-3 w-3"
              alt=""
              data-testid="status-rejected"
            />
          )}
          {status === "current" && (
            <div
              className="rounded-full w-[10px] h-[10px] bg-violet-500"
              data-testid="status-current"
            />
          )}
          {status === undefined && <div data-testid="status-none" />}
        </div>
        {/* Connector */}
        {index !== 0 && (
          <div
            className={`h-[100%] w-[2px] absolute z-5 left-1/2 top-0 ml-[-1px] ${
              status === "done"
                ? "bg-teal-500"
                : status === "rejected"
                ? "bg-red-500"
                : "bg-grey-200"
            }`}
            style={{
              transform: "rotate(180deg)",
              transformOrigin: "top",
            }}
          />
        )}
      </div>
    );
  };

  const Step: React.FC<{
    title: string;
    icon: React.ReactNode;
    text: string | React.ReactNode;
    status?: Status;
    index?: number;
  }> = ({ title, icon, index, text, status }) => {
    return (
      <div className={`flex gap-4`} data-testid={`application-step-${title}`}>
        <StepStatus index={index} status={status} />
        <div
          className={`grid gap-3 mt-[5px] pb-[35px] ${
            !status ? "opacity-[0.6]" : ""
          }`}
          style={{ gridTemplateColumns: "16px 1fr" }}
        >
          <div className="flex justify-center">{icon}</div>
          <div className={`mt-[-3px]`}>
            <p className="text-sm text-grey-400 font-bold capitalize">
              {title}:
            </p>
            <div className="text-sm text-grey-400">{text}</div>
          </div>
        </div>
      </div>
    );
  };

  const getStepStatus = (status: ProjectStatus, isLastStep: boolean) => {
    if (isLastStep && ["PENDING", "IN_REVIEW"].includes(status))
      return "current";

    if (isLastStep && ["REJECTED"].includes(status)) return "rejected";

    return "done";
  };

  const strategyType = application?.payoutStrategy?.strategyName
    ? getRoundStrategyType(application.payoutStrategy.strategyName)
    : undefined;

  const showReviewButton = () =>
    strategyType === "DirectGrants" &&
    application?.status === "PENDING" &&
    application?.inReview === false;

  const showApproveReject = () => {
    if (strategyType !== "DirectGrants") {
      return true;
    }

    if (application?.status === "PENDING" && !application?.inReview) {
      return false;
    }
    return true;
  };

  return isLoading ? (
    <Spinner text="We're fetching the round application." />
  ) : (
    <>
      {!applicationExists && <NotFoundPage />}
      {applicationExists && !hasAccess && <AccessDenied />}
      {applicationExists && hasAccess && (
        <>
          <Navbar />
          <header className="border-b bg-grey-150 px-3 md:px-20 py-6">
            <div className="text-grey-400 font-semibold text-sm flex flex-row items-center gap-3">
              <Link to={`/`}>
                <span>{"My Programs"}</span>
              </Link>
              <ChevronRightIcon className="h-6 w-6" />
              <Link to={`/program/${round?.ownedBy}`}>
                <span>{"Program Details"}</span>
              </Link>
              <ChevronRightIcon className="h-6 w-6" />
              <Link to={`/round/${roundId.toString()}`}>
                <span>{"Round Details"}</span>
              </Link>
              {round && <RoundBadgeStatus round={round} />}
            </div>
            {/* Round type */}
            {getPayoutRoundDescription(
              round?.payoutStrategy.strategyName || ""
            ) && (
              <div
                className={`text-sm text-gray-900 h-[20px] inline-flex flex-col justify-center bg-grey-100 px-3 mt-4`}
                style={{ borderRadius: "20px" }}
              >
                {getPayoutRoundDescription(
                  round?.payoutStrategy.strategyName || ""
                )}
              </div>
            )}
            {round && (
              <div className="flex flex-row mb-1 items-center">
                <RoundName round={round} />
              </div>
            )}
            <div className="flex flex-row flex-wrap relative">
              {round && strategyType === "DirectGrants" && (
                <ApplicationOpenDateRange round={round} />
              )}
              {round && <RoundOpenDateRange round={round} />}
              <div className="absolute right-0">
                <ViewGrantsExplorerButton
                  iconStyle="h-4 w-4"
                  chainId={`${chain.id}`}
                  roundId={id}
                />
              </div>
            </div>
          </header>
          <div className="container mx-auto h-screen px-4 pb-7">
            <main className="flex flex-row">
              {/* Sidebar */}
              {(application?.statusSnapshots || []).length > 0 && (
                <div
                  className="w-24 basis-1/6 border-r pt-12"
                  data-testid="sidebar-steps-container"
                >
                  <div className="flex flex-col">
                    {application
                      .statusSnapshots!.sort((a, b) =>
                        moment(a.updatedAt).diff(moment(b.updatedAt))
                      )
                      .map((s, index) => (
                        <Step
                          key={index}
                          status={getStepStatus(
                            s.status,
                            index === application.statusSnapshots!.length - 1
                          )}
                          title={getApplicationStatusTitle(s.status)}
                          icon={
                            <CalendarIcon className="text-grey-400 h-3 w-3" />
                          }
                          text={
                            <>
                              <div className="mb-[2px]">
                                {moment(s.updatedAt).format("MMMM Do YYYY")}
                              </div>
                              <div>{getUTCTime(s.updatedAt)}</div>
                            </>
                          }
                          index={index}
                        />
                      ))}
                    {/* When is direct round and application is in review */}
                    {strategyType === "DirectGrants" &&
                      application.status === "PENDING" &&
                      !application.inReview && (
                        <>
                          <Step
                            title="In review"
                            icon={
                              <CalendarIcon className="text-grey-400 h-3 w-3" />
                            }
                            text="Waiting"
                          />
                        </>
                      )}
                    {/* When application is not yet evaluated */}
                    {!["APPROVED", "REJECTED"].includes(
                      application.status as string
                    ) && (
                      <>
                        <Step
                          title="Evaluation"
                          icon={
                            <ClipboardCheckIcon className="text-grey-400 h-5 w-5 mt-[-2px] ml-[-2px]" />
                          }
                          text="Waiting"
                        />
                      </>
                    )}
                  </div>
                  {/* Go back */}
                  <Link
                    className="text-sm text-grey-300 flex gap-2 items-center"
                    to={`/round/${round?.id}`}
                  >
                    <ArrowNarrowLeftIcon className="text-grey-300 h-3 w-3" />
                    Back to {round?.roundMetadata?.name || "..."}
                  </Link>
                </div>
              )}
              {/* Main contents */}
              <div className="basis-5/6 pl-6 pt-12">
                {/* Banner Image */}
                {application && (
                  <ApplicationBanner
                    classNameOverride="h-32 w-full object-cover lg:h-80 rounded"
                    application={application}
                  />
                )}
                {/* Logo + Buttons */}
                <div className="pl-4 sm:pl-6 lg:pl-8">
                  <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
                    <div className="flex">
                      {application && (
                        <ApplicationLogo
                          classNameOverride="h-24 w-24 rounded-full ring-4 ring-white bg-white sm:h-32 sm:w-32"
                          application={application}
                        />
                      )}
                    </div>
                    <div className="mt-16 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                      <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                        {/* IN REVIEW */}
                        {showReviewButton() && (
                          <Button
                            type="button"
                            $variant={
                              application?.inReview ? "solid" : "outline"
                            }
                            className="inline-flex justify-center px-4 py-2 text-sm m-auto"
                            disabled={isLoading || isUpdateLoading}
                            onClick={() =>
                              confirmReviewDecision(ApplicationStatus.IN_REVIEW)
                            }
                          >
                            <CheckIcon
                              className="h-5 w-5 mr-1"
                              aria-hidden="true"
                            />
                            {application?.inReview ? "Reviewing" : "In Review"}
                          </Button>
                        )}

                        {/* APPROVE */}
                        {showApproveReject() && (
                          <Button
                            type="button"
                            $variant={
                              application?.status === "APPROVED"
                                ? "solid"
                                : "outline"
                            }
                            className="inline-flex justify-center px-4 py-2 text-sm m-auto"
                            disabled={isLoading || isUpdateLoading}
                            onClick={() =>
                              confirmReviewDecision(ApplicationStatus.APPROVED)
                            }
                          >
                            <CheckIcon
                              className="h-5 w-5 mr-1"
                              aria-hidden="true"
                            />
                            {application?.status === "APPROVED"
                              ? "Approved"
                              : "Approve"}
                          </Button>
                        )}

                        {/* REJECT */}
                        {showApproveReject() && (
                          <Button
                            type="button"
                            $variant={
                              application?.status === "REJECTED"
                                ? "solid"
                                : "outline"
                            }
                            className={
                              "inline-flex justify-center px-4 py-2 text-sm m-auto" +
                              (application?.status === "REJECTED"
                                ? ""
                                : "text-grey-500")
                            }
                            disabled={isLoading || isUpdateLoading}
                            onClick={() =>
                              confirmReviewDecision(ApplicationStatus.REJECTED)
                            }
                          >
                            <XIcon
                              className="h-5 w-5 mr-1"
                              aria-hidden="true"
                            />
                            {application?.status === "REJECTED"
                              ? "Rejected"
                              : "Reject"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Title */}
                <h1 className="text-2xl mt-6 mb-4">
                  {application?.project?.title || "..."}
                </h1>
                {/* Main info */}
                <div className="grid sm:grid-cols-3 gap-2 md:gap-10">
                  {/* Twitter */}
                  {application?.project?.projectTwitter && (
                    <span
                      className="flex flex-row justify-start items-center"
                      data-testid="twitter-info"
                    >
                      <TwitterIcon className="h-4 w-4 mr-2 text-grey-500" />
                      <a
                        href={`https://twitter.com/${application?.project?.projectTwitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-violet-400 mr-2"
                      >
                        {application?.project?.projectTwitter}
                      </a>
                      {getVerifiableCredentialVerificationResultView("twitter")}
                    </span>
                  )}
                  {/* Github */}
                  {registeredGithub && (
                    <span
                      className="flex flex-row items-center"
                      data-testid="github-info"
                    >
                      <GithubIcon className="h-4 w-4 mr-2 text-grey-500" />
                      <a
                        href={`https://github.com/${registeredGithub}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-violet-400 mr-2"
                      >
                        {registeredGithub}
                      </a>
                      {getVerifiableCredentialVerificationResultView("github")}
                    </span>
                  )}
                  {/* Creation date */}
                  <span
                    className="flex flex-row items-center"
                    data-testid="project-createdAt"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2 text-grey-400" />
                    <span className="text-sm text-grey-400">
                      Created on:{" "}
                      {application?.project?.createdAt
                        ? formatDateWithOrdinal(
                            new Date(Number(application?.project?.createdAt))
                          )
                        : "-"}
                    </span>
                  </span>
                </div>
                <hr className="my-6" />
                {/* Description */}
                <h2 className="text-xs mb-2">Description</h2>
                <p
                  dangerouslySetInnerHTML={{
                    __html: renderToHTML(
                      application?.project?.description.replace(
                        /\n/g,
                        "\n\n"
                      ) ?? ""
                    ),
                  }}
                  className="text-md prose prose-h1:text-lg prose-h2:text-base prose-h3:text-base prose-a:text-blue-600"
                ></p>
                <hr className="my-6" />
                {answerBlocks &&
                  answerBlocks?.map((block: AnswerBlock) => {
                    const answerText = Array.isArray(block.answer)
                      ? block.answer.join(", ")
                      : block.answer ?? "";

                    return (
                      <div key={block.questionId} className="pb-5">
                        <h2 className="text-xs mb-1">{block.question}</h2>
                        {block.type === "paragraph" ? (
                          <p
                            dangerouslySetInnerHTML={{
                              __html: renderToHTML(
                                answerText.replace(/\n/g, "\n\n")
                              ),
                            }}
                            className="text-md prose prose-h1:text-lg prose-h2:text-base prose-h3:text-base prose-a:text-blue-600"
                          ></p>
                        ) : (
                          <p className="text-md prose prose-h1:text-lg prose-h2:text-base prose-h3:text-base prose-a:text-blue-600">
                            {answerText.replace(/\n/g, "<br/>")}
                          </p>
                        )}
                      </div>
                    );
                  })}
                {round !== undefined &&
                  strategyType === "DirectGrants" &&
                  application?.status === "APPROVED" &&
                  answerBlocks !== undefined &&
                  answerBlocks.length > 0 && (
                    <ApplicationDirectPayout
                      round={round}
                      application={application}
                      answerBlocks={answerBlocks}
                    />
                  )}
              </div>
              {/* Modals */}
              <ConfirmationModal
                confirmButtonText={
                  isUpdateLoading ? "Confirming..." : "Confirm"
                }
                body={
                  <p className="text-sm text-grey-400">
                    {reviewDecision == "IN_REVIEW"
                      ? 'You have moved to "In Review" status a Grant Application. This will carry gas fees based on the selected network.'
                      : `You have ${reviewDecision?.toLowerCase()} a Grant Application. This will carry gas fees based on the selected network.`}
                  </p>
                }
                confirmButtonAction={handleReview}
                cancelButtonAction={() => {
                  setOpenModal(false);
                  setTimeout(() => setReviewDecision(undefined), 500);
                }}
                isOpen={openModal}
                setIsOpen={setOpenModal}
              />
              <ProgressModal
                isOpen={openProgressModal}
                subheading={
                  "Please hold while we update the grant application."
                }
                steps={progressSteps}
              />
              <ErrorModal
                isOpen={openErrorModal}
                setIsOpen={setOpenErrorModal}
                tryAgainFn={handleReview}
              />
            </main>
            <Footer />
          </div>
        </>
      )}
    </>
  );
}

function vcProviderMatchesProject(
  provider: string,
  verifiableCredential: VerifiableCredential,
  application: GrantApplication | undefined
) {
  let vcProviderMatchesProject = false;
  if (provider === "twitter") {
    vcProviderMatchesProject =
      verifiableCredential.credentialSubject.provider
        ?.split("#")[1]
        .toLowerCase() === application?.project?.projectTwitter?.toLowerCase();
  } else if (provider === "github") {
    vcProviderMatchesProject =
      verifiableCredential.credentialSubject.provider
        ?.split("#")[1]
        .toLowerCase() === application?.project?.projectGithub?.toLowerCase();
  }
  return vcProviderMatchesProject;
}

function vcIssuedToAddress(vc: VerifiableCredential, address: string) {
  const vcIdSplit = vc.credentialSubject.id.split(":");
  const addressFromId = vcIdSplit[vcIdSplit.length - 1];
  return addressFromId.toLowerCase() === address.toLowerCase();
}

async function isVerified(
  verifiableCredential: VerifiableCredential,
  verifier: PassportVerifierWithExpiration,
  provider: string,
  application: GrantApplication | undefined
) {
  const vcHasValidProof = await verifier.verifyCredential(verifiableCredential);
  const vcIssuedByValidIAMServer = verifiableCredential.issuer === IAM_SERVER;
  const providerMatchesProject = vcProviderMatchesProject(
    provider,
    verifiableCredential,
    application
  );
  const vcIssuedToAtLeastOneProjectOwner = (
    application?.project?.owners ?? []
  ).some((owner) => vcIssuedToAddress(verifiableCredential, owner.address));

  return vcHasValidProof &&
    vcIssuedByValidIAMServer &&
    providerMatchesProject &&
    vcIssuedToAtLeastOneProjectOwner
    ? VerifiedCredentialState.VALID
    : VerifiedCredentialState.INVALID;
}

function redirectToViewRoundPage(
  navigate: NavigateFunction,
  waitSeconds: number,
  id: string
) {
  setTimeout(() => {
    navigate(`/round/${id}`);
  }, waitSeconds);
}

function redirectToViewApplicationPage(
  navigate: NavigateFunction,
  waitSeconds: number,
  id: string,
  applicationId: string
) {
  setTimeout(() => {
    navigate(`/round/${id}/application/${applicationId}`);
  }, waitSeconds);
}
