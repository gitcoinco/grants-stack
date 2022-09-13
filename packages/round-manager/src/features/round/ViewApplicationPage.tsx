import {
  ArrowNarrowLeftIcon,
  CheckIcon,
  MailIcon,
  ShieldCheckIcon,
  XCircleIcon,
  XIcon,
} from "@heroicons/react/solid";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useListGrantApplicationsQuery,
  useUpdateGrantApplicationMutation,
} from "../api/services/grantApplication";
import { useListRoundsQuery } from "../api/services/round";
import ConfirmationModal from "../common/ConfirmationModal";
import Navbar from "../common/Navbar";
import { useWallet } from "../common/Auth";
import { Button } from "../common/styles";
import { ReactComponent as TwitterIcon } from "../../assets/twitter-logo.svg";
import { ReactComponent as GithubIcon } from "../../assets/github-logo.svg";
import Footer from "../common/Footer";
import { datadogLogs } from "@datadog/browser-logs";
import { PassportVerifier } from "@gitcoinco/passport-sdk-verifier";
import {
  AnswerBlock,
  GrantApplication,
  ProjectCredentials,
} from "../api/types";
import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { Lit } from "../api/lit";
import { utils } from "ethers";
import NotFoundPage from "../common/NotFoundPage";
import AccessDenied from "../common/AccessDenied";

type ApplicationStatus = "APPROVED" | "REJECTED";

enum VerifiedCredentialState {
  VALID,
  INVALID,
  PENDING,
}

enum ApplicationQuestions {
  GITHUB = "Github",
  GITHUB_ORGANIZATION = "Github Organization",
  TWITTER = "Twitter",
  EMAIL = "Email",
  FUNDING_SOURCE = "Funding Source",
  PROFIT_2022 = "Profit2022",
  TEAM_SIZE = "Team Size",
}

export const IAM_SERVER =
  "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC";

export default function ViewApplicationPage() {
  datadogLogs.logger.info("====> Route: /program/create");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const [reviewDecision, setReviewDecision] = useState<
    ApplicationStatus | undefined
  >(undefined);
  const [openModal, setOpenModal] = useState(false);
  const [verifiedProviders, setVerifiedProviders] = useState<{
    [key: string]: VerifiedCredentialState;
  }>({
    github: VerifiedCredentialState.PENDING,
    twitter: VerifiedCredentialState.PENDING,
  });

  const { roundId, id } = useParams() as { roundId: string; id: string };
  const { chain, address, provider, signer } = useWallet();
  const navigate = useNavigate();
  const verifier = new PassportVerifier();

  const {
    application,
    isLoading,
    isSuccess: isApplicationFetched,
  } = useListGrantApplicationsQuery(
    /* Non-issue since if ID was null or undef., we wouldn't render this page, but a 404 instead  */
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    { roundId: roundId!, signerOrProvider: provider, id },
    {
      selectFromResult: ({ data, isLoading, isSuccess }) => ({
        application: data?.find((application) => application.id === id),
        isLoading,
        isSuccess,
      }),
    }
  );

  const credentials: ProjectCredentials =
    application?.project!.credentials ?? {};

  useEffect(() => {
    if (!credentials) {
      return;
    }
    const verify = async () => {
      const newVerifiedProviders: { [key: string]: VerifiedCredentialState } = {
        ...verifiedProviders,
      };
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { round } = useListRoundsQuery(
    { signerOrProvider: provider, roundId: roundId },
    {
      selectFromResult: ({ data }) => ({
        round: data?.find((round) => round.id === roundId),
      }),
    }
  );

  const [updateGrantApplication, { isLoading: updating }] =
    useUpdateGrantApplicationMutation();

  const handleUpdateGrantApplication = async () => {
    try {
      setOpenModal(false);

      await updateGrantApplication({
        roundId,
        application: {
          status: reviewDecision!,
          id: application!.id,
          round: roundId!,
          recipient: application!.recipient,
          projectsMetaPtr: application!.projectsMetaPtr,
        },
        signer,
        provider,
      }).unwrap();

      navigate(0);
    } catch (e) {
      console.error(e);
    }
  };

  const confirmReviewDecision = (status: ApplicationStatus) => {
    setReviewDecision(status);
    setOpenModal(true);
  };

  const handleCancelModal = () => {
    setOpenModal(false);
    setTimeout(() => setReviewDecision(undefined), 500);
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

  useEffect(() => {
    if (isApplicationFetched) {
      setApplicationExists(!!application);
      if (round) {
        round.operatorWallets?.includes(address?.toLowerCase())
          ? setHasAccess(true)
          : setHasAccess(false);
      } else {
        setHasAccess(true);
      }
    }
  }, [address, application, isApplicationFetched, round]);

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
                chain: chain.name.toLowerCase(),
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

    if (isApplicationFetched && hasAccess) {
      decryptAnswers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application, isLoading, hasAccess, isApplicationFetched]);

  const getAnswer = (question: string) => {
    const answerBlock = answerBlocks?.find(
      (answerBlock: AnswerBlock) => answerBlock.question === question
    );
    return answerBlock ? answerBlock.answer : "N/A";
  };

  return (
    <>
      {!applicationExists && <NotFoundPage />}
      {!hasAccess && <AccessDenied />}
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
                <div>
                  <img
                    className="h-32 w-full object-cover lg:h-80 rounded"
                    src={`https://${
                      process.env.REACT_APP_PINATA_GATEWAY
                    }/ipfs/${application?.project!.bannerImg}`}
                    alt=""
                  />
                </div>
                <div className="pl-4 sm:pl-6 lg:pl-8">
                  <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
                    <div className="flex">
                      <img
                        className="h-24 w-24 rounded-full ring-4 ring-white bg-white sm:h-32 sm:w-32"
                        src={`https://${
                          process.env.REACT_APP_PINATA_GATEWAY
                        }/ipfs/${application?.project!.logoImg}`}
                        alt=""
                      />
                    </div>
                    <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                      <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                        <Button
                          type="button"
                          $variant={
                            application?.status === "APPROVED"
                              ? "solid"
                              : "outline"
                          }
                          className="inline-flex justify-center px-4 py-2 text-sm"
                          disabled={isLoading || updating}
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
                            "inline-flex justify-center px-4 py-2 text-sm" +
                            (application?.status === "REJECTED"
                              ? ""
                              : "text-grey-500")
                          }
                          disabled={isLoading || updating}
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
                body={
                  <p className="text-sm text-grey-400">
                    {`You have ${reviewDecision?.toLowerCase()} a Grant Application. This will carry gas fees based on the selected network`}
                  </p>
                }
                confirmButtonAction={handleUpdateGrantApplication}
                cancelButtonAction={handleCancelModal}
                isOpen={openModal}
                setIsOpen={setOpenModal}
              />
            </header>

            <main>
              <h1 className="text-2xl mt-6">
                {application?.project!.title || "..."}
              </h1>
              <div className="sm:flex sm:justify-between my-6">
                <div className="sm:basis-3/4 sm:mr-3">
                  <div className="grid sm:grid-cols-3 gap-2 md:gap-10">
                    <div className="text-grey-500 truncate block">
                      <MailIcon className="inline-flex h-4 w-4 text-grey-500 mr-1" />
                      <span className="text-xs text-grey-400">
                        {getAnswer(ApplicationQuestions.EMAIL)}
                      </span>
                    </div>
                    <span
                      className="text-grey-500 flex flex-row justify-start items-center"
                      data-testid="twitter-info"
                    >
                      <TwitterIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm text-violet-400 mr-2">
                        {getAnswer(ApplicationQuestions.TWITTER)}
                      </span>
                      {getVerifiableCredentialVerificationResultView("twitter")}
                    </span>

                    <span
                      className="text-grey-500 flex flex-row justify-start items-center"
                      data-testid="github-info"
                    >
                      <GithubIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm text-violet-400 mr-2">
                        {getAnswer(ApplicationQuestions.GITHUB)}
                      </span>
                      {getVerifiableCredentialVerificationResultView("github")}
                    </span>
                  </div>

                  <hr className="my-6" />

                  <h2 className="text-xs mb-2">Description</h2>
                  <p className="text-base">
                    {application?.project!.description}
                  </p>

                  <hr className="my-6" />

                  <h2 className="text-xs mb-2">Funding Sources</h2>
                  <p className="text-base mb-6">
                    {getAnswer(ApplicationQuestions.FUNDING_SOURCE)}
                  </p>

                  <h2 className="text-xs mb-2">Funding Profit</h2>
                  <p className="text-base mb-6">
                    {getAnswer(ApplicationQuestions.PROFIT_2022)}
                  </p>

                  <h2 className="text-xs mb-2">Team Size</h2>
                  <p className="text-base mb-6">
                    {getAnswer(ApplicationQuestions.TEAM_SIZE)}
                  </p>
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

const getCredentialSubject = (
  question: string,
  application: GrantApplication | undefined
) => {
  return (
    application?.answers!.find((answer) => answer.question === question)
      ?.answer || "N/A"
  );
};

function vcProviderMatchesProject(
  provider: string,
  verifiableCredential: VerifiableCredential,
  application: GrantApplication | undefined
) {
  let vcProviderMatchesProject = false;
  if (provider === "twitter") {
    vcProviderMatchesProject =
      verifiableCredential.credentialSubject.provider?.split("#")[1] ===
      getCredentialSubject(ApplicationQuestions.TWITTER, application);
  } else if (provider === "github") {
    vcProviderMatchesProject =
      verifiableCredential.credentialSubject.provider?.split("#")[1] ===
      getCredentialSubject(
        ApplicationQuestions.GITHUB_ORGANIZATION,
        application
      );
  }
  return vcProviderMatchesProject;
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

  return vcHasValidProof && vcIssuedByValidIAMServer && providerMatchesProject
    ? VerifiedCredentialState.VALID
    : VerifiedCredentialState.INVALID;
}
