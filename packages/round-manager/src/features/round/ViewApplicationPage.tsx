import {
  ArrowNarrowLeftIcon,
  CheckIcon,
  ShieldCheckIcon,
  XCircleIcon,
  XIcon,
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
import Footer from "common/src/components/Footer";
import { datadogLogs } from "@datadog/browser-logs";
import { useBulkUpdateGrantApplications } from "../../context/application/BulkUpdateGrantApplicationContext";
import ProgressModal from "../common/ProgressModal";
import { PassportVerifier } from "@gitcoinco/passport-sdk-verifier";
import {
  AnswerBlock,
  GrantApplication,
  ProgressStatus,
  ProgressStep,
  ProjectCredentials,
} from "../api/types";
import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { Lit } from "../api/lit";
import { utils } from "ethers";
import NotFoundPage from "../common/NotFoundPage";
import AccessDenied from "../common/AccessDenied";
import { useApplicationByRoundId } from "../../context/application/ApplicationContext";
import { Spinner } from "../common/Spinner";
import { ApplicationBanner, ApplicationLogo } from "./BulkApplicationCommon";
import { useRoundById } from "../../context/round/RoundContext";
import ErrorModal from "../common/ErrorModal";
import { errorModalDelayMs } from "../../constants";

import {
  CalendarIcon,
  formatDateWithOrdinal,
  VerifiedCredentialState,
} from "common";
import { renderToHTML } from "common";
import { useDebugMode } from "../../hooks";

type ApplicationStatus = "APPROVED" | "REJECTED";

export const IAM_SERVER =
  "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC";

const verifier = new PassportVerifier();

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

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { applications, isLoading } = useApplicationByRoundId(roundId!);
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
      description: "The subgraph is indexing the data.",
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

  const handleReview = async () => {
    try {
      if (!application) {
        throw "error: application does not exist";
      }

      setOpenProgressModal(true);
      setOpenModal(false);

      application.status = reviewDecision;

      await bulkUpdateGrantApplications({
        roundId: roundId,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        applications: applications!,
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
                chain:
                  chain.name.toLowerCase() === "pgn"
                    ? "publicGoodsNetwork"
                    : chain.name.toLowerCase(),
                contract: utils.getAddress(roundId),
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
  }, [application, hasAccess, isLoading]);

  // Handle case where project github is not set but user github is set. if both are not available, set to null
  const registeredGithub =
    application?.project?.projectGithub ?? application?.project?.userGithub;

  return isLoading ? (
    <Spinner text="We're fetching the round application." />
  ) : (
    <>
      {!applicationExists && <NotFoundPage />}
      {applicationExists && !hasAccess && <AccessDenied />}
      {applicationExists && hasAccess && (
        <>
          <Navbar />
          <div className="container mx-auto h-screen px-4 py-7">
            <header>
              <div className="flex gap-2 mb-6">
                <ArrowNarrowLeftIcon className="h-3 w-3 mt-1 bigger" />
                <Link className="text-sm gap-2" to={`/round/${round?.id}`}>
                  <span>{round?.roundMetadata?.name || "..."}</span>
                </Link>
              </div>
              <div>
                {application && (
                  <ApplicationBanner
                    classNameOverride="h-32 w-full object-cover lg:h-80 rounded"
                    application={application}
                  />
                )}
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
                        <Button
                          type="button"
                          $variant={
                            application?.status === "APPROVED"
                              ? "solid"
                              : "outline"
                          }
                          className="inline-flex justify-center px-4 py-2 text-sm m-auto"
                          disabled={isLoading || isUpdateLoading}
                          onClick={() => confirmReviewDecision("APPROVED")}
                        >
                          <CheckIcon
                            className="h-5 w-5 mr-1"
                            aria-hidden="true"
                          />
                          {application?.status === "APPROVED"
                            ? "Approved"
                            : "Approve"}
                        </Button>
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
                          onClick={() => confirmReviewDecision("REJECTED")}
                        >
                          <XIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                          {application?.status === "REJECTED"
                            ? "Rejected"
                            : "Reject"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <ConfirmationModal
                confirmButtonText={
                  isUpdateLoading ? "Confirming..." : "Confirm"
                }
                body={
                  <p className="text-sm text-grey-400">
                    {`You have ${reviewDecision?.toLowerCase()} a Grant Application. This will carry gas fees based on the selected network`}
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
            </header>

            <main>
              <h1 className="text-2xl mt-6">
                {application?.project?.title || "..."}
              </h1>
              <div className="sm:flex sm:justify-between my-6">
                <div className="sm:basis-3/4 sm:mr-3">
                  <div className="grid sm:grid-cols-3 gap-2 md:gap-10">
                    <span
                      className="text-grey-500 flex flex-row justify-start items-center"
                      data-testid="twitter-info"
                    >
                      <TwitterIcon className="h-4 w-4 mr-2" />
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

                    <span
                      className="text-grey-500 flex flex-row justify-start items-center"
                      data-testid="github-info"
                    >
                      <GithubIcon className="h-4 w-4 mr-2" />
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

                    <span
                      className="text-grey-500 flex flex-row justify-start items-center"
                      data-testid="project-createdAt"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm text-violet-400 mr-2">
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
                          <h2 className="text-xs mb-2">{block.question}</h2>
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
                            <p className="text-base text-black">
                              {answerText.replace(/\n/g, "<br/>")}
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
                <div className="sm:basis-1/4 text-center sm:ml-3"></div>
              </div>
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
  return addressFromId === address;
}

async function isVerified(
  verifiableCredential: VerifiableCredential,
  verifier: PassportVerifier,
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
