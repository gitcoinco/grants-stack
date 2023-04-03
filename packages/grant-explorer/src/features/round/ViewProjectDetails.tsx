import { datadogLogs } from "@datadog/browser-logs";
import { Link, useParams } from "react-router-dom";
import { useRoundById } from "../../context/RoundContext";
import { ProjectBanner } from "../common/ProjectBanner";
import DefaultLogoImage from "../../assets/default_logo.png";
import { PassportVerifier } from "@gitcoinco/passport-sdk-verifier";
import {
  GrantApplicationFormAnswer,
  Project,
  ProjectCredentials,
  ProjectMetadata,
  Round,
} from "../api/types";
import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";
import {
  ChevronLeftIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  BoltIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid";
import { ReactComponent as TwitterIcon } from "../../assets/twitter-logo.svg";
import { ReactComponent as GithubIcon } from "../../assets/github-logo.svg";
import { Button } from "common/src/styles";
import { useBallot } from "../../context/BallotContext";
import Navbar from "../common/Navbar";
import ReactTooltip from "react-tooltip";
import { useEffect, useState } from "react";
import Footer from "../common/Footer";
import { getProjectSummary } from "../api/api";
import { ReactComponent as PushLogo } from "../../assets/push-gitcoin-scroll-logo.svg";
import PushChat from "./Pushchat";
import {
  getUserPgpKeys,
  verifyPushChatUser,
  createPushGroup,
  joinGroup,
} from "../api/pushChat";
import useSWR from "swr";
import { formatDistanceToNowStrict } from "date-fns";
import RoundEndedBanner from "../common/RoundEndedBanner";
import PassportBanner from "../common/PassportBanner";
import markdown from "../../app/markdown";
import Auth from "../common/Auth";

enum VerifiedCredentialState {
  VALID,
  INVALID,
  PENDING,
}

export const IAM_SERVER =
  "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC";

const verifier = new PassportVerifier();

export default function ViewProjectDetails() {
  datadogLogs.logger.info(
    "====> Route: /round/:chainId/:roundId/:applicationId"
  );
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);
  const { chainId, roundId, applicationId } = useParams();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { round, isLoading } = useRoundById(chainId!, roundId!);

  const projectToRender = round?.approvedProjects?.find(
    (project) => project.grantApplicationId === applicationId
  );

  const currentTime = new Date();
  const isBeforeRoundEndDate = round && round.roundEndTime > currentTime;
  const isAfterRoundEndDate = round && round.roundEndTime <= currentTime;
  const [
    shortlist,
    finalBallot,
    handleAddProjectsToShortlist,
    handleRemoveProjectsFromShortlist,
    ,
    handleRemoveProjectsFromFinalBallot,
  ] = useBallot();
  const isAddedToShortlist = shortlist.some(
    (project) => project.grantApplicationId === applicationId
  );
  const isAddedToFinalBallot = finalBallot.some(
    (project) => project.grantApplicationId === applicationId
  );
  const wallet = Auth();

  const [pgpKeys, setPgpKeys] = useState<string>("");
  const [pushChatId, setPushChatID] = useState<string>("");
  const [position, setPosition] = useState<string>("None");

  // useEffect(() => {
  //   handlePgpKeys();
  // }, []);

  const handlePgpKeys = async () => {
    if (wallet.props.context) {
      const decryptedKeys = await getUserPgpKeys(wallet.props.context.address);
      if (!decryptedKeys) {
        return;
      }
      setPgpKeys(decryptedKeys);
      return decryptedKeys;
    }
  };

  const handlePushChatID = (chatId: string) => {
    setPushChatID(chatId);
  };

  return (
    <>
      <Navbar roundUrlPath={`/round/${chainId}/${roundId}`} />
      {isBeforeRoundEndDate && <PassportBanner />}
      {isAfterRoundEndDate && (
        <div>
          <RoundEndedBanner />
        </div>
      )}
      <div className="relative top-16 lg:mx-20 h-screen px-4 py-7">
        <main>
          <div className="flex flex-row items-center gap-3 text-sm justify-between">
            <div className="flex flex-row items-center gap-3 text-sm">
              <ChevronLeftIcon className="h-5 w-5 mt-6 mb-6" />
              <Link to={`/round/${chainId}/${roundId}`}>
                <span className="font-normal">Back to Grants</span>
              </Link>
            </div>
          </div>
          {!isLoading && projectToRender && (
            <>
              <Header projectMetadata={projectToRender.projectMetadata} />
              <div className="flex flex-col md:flex-row">
                <div className="grow">
                  <div>
                    <ProjectTitle
                      projectMetadata={projectToRender.projectMetadata}
                    />
                    <AboutProject projectToRender={projectToRender} />
                  </div>
                  <div>
                    <DescriptionTitle />
                    <Detail
                      text={projectToRender.projectMetadata.description}
                      testID="project-metadata"
                    />
                    <ApplicationFormAnswers
                      answers={projectToRender.grantApplicationFormAnswers}
                    />
                  </div>
                  <PushChat
                    handlePushChatID={handlePushChatID}
                    pushChatId={pushChatId}
                    pgpKeys={pgpKeys}
                    position={position}
                    setPosition={setPosition}
                    handlePgpKeys={handlePgpKeys}
                  />
                </div>
                <Sidebar
                  pushChatId={pushChatId}
                  pgpKeys={pgpKeys}
                  handlePushChatID={handlePushChatID}
                  position={position}
                  setPosition={setPosition}
                  handlePgpKeys={handlePgpKeys}
                  isAdded={isAddedToShortlist || isAddedToFinalBallot}
                  removeFromShortlist={() => {
                    handleRemoveProjectsFromShortlist([projectToRender]);
                  }}
                  removeFromFinalBallot={() => {
                    handleRemoveProjectsFromFinalBallot([projectToRender]);
                  }}
                  addToShortlist={() => {
                    handleAddProjectsToShortlist([projectToRender]);
                  }}
                />
              </div>
            </>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}

function Header(props: { projectMetadata: ProjectMetadata }) {
  return (
    <div>
      <ProjectBanner
        projectMetadata={props.projectMetadata}
        classNameOverride="h-32 w-full object-cover lg:h-80 rounded"
      />
      <div className="pl-4 sm:pl-6 lg:pl-8">
        <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
          <div className="flex">
            <ProjectLogo
              projectMetadata={props.projectMetadata}
              classNameOverride="h-24 w-24 rounded-full ring-4 ring-white bg-white sm:h-32 sm:w-32"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectTitle(props: { projectMetadata: ProjectMetadata }) {
  return (
    <div className="border-b-2 pb-2">
      <h1 className="text-3xl mt-6 font-thin text-black">
        {props.projectMetadata.title}
      </h1>
    </div>
  );
}

function AboutProject(props: { projectToRender: Project }) {
  const [verifiedProviders, setVerifiedProviders] = useState<{
    [key: string]: VerifiedCredentialState;
  }>({
    github: VerifiedCredentialState.PENDING,
    twitter: VerifiedCredentialState.PENDING,
  });

  const { projectToRender } = props;
  const projectRecipient =
    projectToRender.recipient.slice(0, 6) +
    "..." +
    projectToRender.recipient.slice(-4);
  const projectWebsite = projectToRender.projectMetadata.website;
  const projectTwitter = projectToRender.projectMetadata.projectTwitter;
  const userGithub = projectToRender.projectMetadata.userGithub;
  const projectGithub = projectToRender.projectMetadata.projectGithub;

  useEffect(() => {
    if (projectToRender?.projectMetadata?.owners) {
      const credentials: ProjectCredentials =
        projectToRender?.projectMetadata.credentials ?? {};

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
              projectToRender
            );
          }
        }

        setVerifiedProviders(newVerifiedProviders);
      };
      verify();
    }
  }, [projectToRender?.projectMetadata.owners]); // eslint-disable-line react-hooks/exhaustive-deps

  const getVerifiableCredentialVerificationResultView = (provider: string) => {
    switch (verifiedProviders[provider]) {
      case VerifiedCredentialState.VALID:
        return (
          <span className="rounded-full bg-teal-100 px-2.5 inline-flex flex-row justify-center items-center">
            <ShieldCheckIcon
              className="w-5 h-5 text-teal-500 mr-2"
              data-testid={`${provider}-verifiable-credential`}
            />
            <p className="text-teal-500 font-medium text-xs">Verified</p>
          </span>
        );
      default:
        return <></>;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 border-b-2 pt-2 pb-6">
      {projectRecipient && (
        <span className="flex items-center mt-4 gap-1">
          <BoltIcon className="h-4 w-4 mr-1 opacity-40" />
          <DetailSummary
            text={`${projectRecipient}`}
            testID="project-recipient"
            sm={true}
          />
        </span>
      )}
      {projectWebsite && (
        <span className="flex items-center mt-4 gap-1">
          <GlobeAltIcon className="h-4 w-4 mr-1 opacity-40" />
          <a
            href={projectWebsite}
            target="_blank"
            rel="noreferrer"
            className="text-base font-normal text-black"
          >
            <DetailSummary
              text={`${projectWebsite}`}
              testID="project-website"
            />
          </a>
        </span>
      )}
      {projectTwitter && (
        <span className="flex items-center mt-4 gap-1">
          <TwitterIcon className="h-4 w-4 mr-1 opacity-40" />
          <a
            href={`https://twitter.com/${projectTwitter}`}
            target="_blank"
            rel="noreferrer"
            className="text-base font-normal text-black"
          >
            <DetailSummary
              text={`@${projectTwitter}`}
              testID="project-twitter"
            />
          </a>
          {getVerifiableCredentialVerificationResultView("twitter")}
        </span>
      )}
      {userGithub && (
        <span className="flex items-center mt-4 gap-1">
          <GithubIcon className="h-4 w-4 mr-1 opacity-40" />
          <a
            href={`https://github.com/${userGithub}`}
            target="_blank"
            rel="noreferrer"
            className="text-base font-normal text-black"
          >
            <DetailSummary text={`${userGithub}`} testID="user-github" />
          </a>
        </span>
      )}
      {projectGithub && (
        <span className="flex items-center mt-4 gap-1">
          <GithubIcon className="h-4 w-4 mr-1 opacity-40" />
          <a
            href={`https://github.com/${projectGithub}`}
            target="_blank"
            rel="noreferrer"
            className="text-base font-normal text-black"
          >
            <DetailSummary text={`${projectGithub}`} testID="project-github" />
          </a>
          {getVerifiableCredentialVerificationResultView("github")}
        </span>
      )}
    </div>
  );
}

function DescriptionTitle() {
  return <h1 className="text-2xl mt-8 font-thin text-black">About</h1>;
}

function DetailSummary(props: { text: string; testID: string; sm?: boolean }) {
  return (
    <p
      className={`${props.sm ? "text-sm" : "text-base"} font-normal text-black`}
      data-testid={props.testID}
    >
      {" "}
      {props.text}{" "}
    </p>
  );
}

function Detail(props: { text: string; testID: string }) {
  return (
    <p
      dangerouslySetInnerHTML={{
        __html: markdown.renderToHTML(props.text.replace(/\n/g, "\n\n")),
      }}
      className="text-md prose prose-h1:text-lg prose-h2:text-base prose-h3:text-base prose-a:text-blue-600"
      data-testid={props.testID}
    />
  );
}

function ApplicationFormAnswers(props: {
  answers: GrantApplicationFormAnswer[];
}) {
  // only show answers that are not empty and are not marked as hidden
  const answers = props.answers.filter((a) => !!a.answer && !a.hidden);

  if (answers.length === 0) {
    return null;
  }

  return (
    <div>
      <h1 className="text-2xl mt-8 font-thin text-black">
        Additional Information
      </h1>
      <div>
        {answers.map((answer) => {
          const answerText = Array.isArray(answer.answer)
            ? answer.answer.join(", ")
            : answer.answer;
          return (
            <div key={answer.questionId}>
              <p className="text-md mt-8 mb-3 font-semibold text-black">
                {answer.question}
              </p>
              {answer.type === "paragraph" ? (
                <p
                  dangerouslySetInnerHTML={{
                    __html: markdown.renderToHTML(
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
    </div>
  );
}

export function ProjectLogo(props: {
  projectMetadata: ProjectMetadata;
  classNameOverride?: string;
}) {
  const { projectMetadata, classNameOverride } = props;

  const applicationLogoImage = projectMetadata.logoImg
    ? `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${projectMetadata.logoImg}`
    : DefaultLogoImage;

  return (
    <div className="pl-4">
      <div className="-mt-6 sm:-mt-6 sm:flex sm:items-end sm:space-x-5">
        <div className="flex">
          <img
            className={
              classNameOverride ??
              "h-12 w-12 rounded-full ring-4 ring-white bg-white"
            }
            src={applicationLogoImage}
            alt="Project Logo"
          />
        </div>
      </div>
    </div>
  );
}

function Sidebar(props: {
  pushChatId: string;
  isAdded: boolean;
  removeFromShortlist: () => void;
  removeFromFinalBallot: () => void;
  addToShortlist: () => void;
  handlePushChatID: (e: string) => void;
  position: string;
  setPosition: (e: string) => void;
  pgpKeys: string;
  handlePgpKeys: () => Promise<string>;
}) {
  const wallet = Auth();
  const [isPresent, setIsPresent] = useState<boolean>(true);
  const { chainId, roundId, applicationId } = useParams();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { round } = useRoundById(chainId!, roundId!);
  const project = round?.approvedProjects?.find(
    (project) => project.grantApplicationId === applicationId
  );

  const { position, setPosition } = props;

  useEffect(() => {
    handlePositions(wallet, project as Project);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const handlePositions = async (wallet: any, project: Project) => {
    if (!wallet || !project) {
      console.log("Inside the section");
      return;
    }
    console.log("Out of section");
    const { isMember, isOwner, chatId, isContributor } =
      await verifyPushChatUser(project, wallet);

    if (!chatId) {
      setIsPresent(false);
    }
    if (!isMember && !isOwner) {
      setIsPresent(false);
    }
    if (chatId) {
      props.handlePushChatID(chatId as string);
    }

    if (isOwner) {
      setPosition("Owner");
      return;
    }
    if (isMember && isContributor) {
      setPosition("Member");
      return;
    }
    if (isContributor) {
      setPosition("Contributor");
      return;
    }
  };

  const handleClickScroll = () => {
    const pushChatElement = document.getElementById("push-chat");
    if (pushChatElement) {
      pushChatElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleGroupCreation = async () => {
    const pgpKeys = await props.handlePgpKeys();
    const {
      props: {
        context: { address: account },
      },
    } = wallet;
    if (!isPresent) {
      if (position === "Owner") {
        const groupChatId = await createPushGroup(
          pgpKeys,
          project as Project,
          account,
          round as Round
        );
        if (!groupChatId) return;
        props.handlePushChatID(groupChatId);
        setPosition("Owner");
        setIsPresent(true);
        handleClickScroll();
        return;
      }
    }

    if (position === "Contributor") {
      await joinGroup(account, project as Project, pgpKeys);
      props.handlePushChatID("");
      setPosition("Contributor");
      setIsPresent(true);
      return;
    }
    handleClickScroll();
    return;
  };

  const chatButtonText =
    !isPresent && position === "Owner" ? "Create Group Chat" : "Comment";

  return (
    <div className="mt-6 md:mt-0 self-center md:self-auto md:ml-6 flex flex-col">
      <ProjectStats />
      <Button
        onClick={() => handleGroupCreation()}
        className={
          "w-80 self-center justify-center bg-[#6F3FF5] text-white font-semibold py-2 px-4 border border-[#A283F9] rounded my-2 box-border"
        }
      >
        {chatButtonText}
      </Button>

      <BallotSelectionToggle
        isAdded={props.isAdded}
        removeFromShortlist={props.removeFromShortlist}
        removeFromFinalBallot={props.removeFromFinalBallot}
        addToBallot={props.addToShortlist}
      />
      <ShortlistTooltip />
      <ScollComponent handleClickScroll={handleClickScroll} />
    </div>
  );
}

export function ProjectStats() {
  const { chainId, roundId, applicationId } = useParams();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { round } = useRoundById(chainId!, roundId!);
  const project = round?.approvedProjects?.find(
    (project) => project.grantApplicationId === applicationId
  );
  const { data } = useSWR(
    {
      chainId,
      roundId,
      projectId: project?.recipient,
    },
    getProjectSummary
  );

  const timeRemaining = round?.roundEndTime
    ? formatDistanceToNowStrict(round.roundEndTime)
    : null;

  return (
    <div className={"rounded bg-gray-50 mb-4 p-4 gap-4 flex flex-col"}>
      <div>
        <h3>${data?.data.totalContributionsInUSD?.toFixed() ?? "-"}</h3>
        <p>funding received in current round</p>
      </div>
      <div>
        <h3>{data?.data.uniqueContributors ?? "-"}</h3>
        <p>contributors</p>
      </div>
      <div>
        {(round?.roundEndTime ?? 0) > new Date() ? (
          <>
            <h3>{timeRemaining ?? "-"}</h3>
            <p>to go</p>
          </>
        ) : (
          <>
            <p>Round ended</p>
            <h3>{timeRemaining} ago</h3>
          </>
        )}
      </div>
    </div>
  );
}

function BallotSelectionToggle(props: {
  isAdded: boolean;
  addToBallot: () => void;
  removeFromShortlist: () => void;
  removeFromFinalBallot: () => void;
}) {
  const { applicationId } = useParams();
  const [shortlist, finalBallot] = useBallot();

  const isAddedToShortlist = shortlist.some(
    (project) => project.grantApplicationId === applicationId
  );
  const isAddedToFinalBallot = finalBallot.some(
    (project) => project.grantApplicationId === applicationId
  );
  // if the project is not added, show the add to shortlist button
  // if the project is added to the shortlist, show the remove from shortlist button
  // if the project is added to the final ballot, show the remove from final ballot button
  if (props.isAdded) {
    if (isAddedToShortlist) {
      return (
        <Button
          data-testid="remove-from-shortlist"
          onClick={props.removeFromShortlist}
          className={
            "w-80 bg-transparent hover:bg-red-500 text-red-400 font-semibold hover:text-white py-2 px-4 border border-red-400 hover:border-transparent rounded"
          }
        >
          Remove from Shortlist
        </Button>
      );
    }
    if (isAddedToFinalBallot) {
      return (
        <Button
          data-testid="remove-from-final-ballot"
          onClick={props.removeFromFinalBallot}
          className={
            "w-80 bg-transparent hover:bg-red-500 text-red-400 font-semibold hover:text-white py-2 px-4 border border-red-400 hover:border-transparent rounded"
          }
        >
          Remove from Final Ballot
        </Button>
      );
    }
  }
  return (
    <Button
      data-testid="add-to-shortlist"
      onClick={() => {
        props.addToBallot();
      }}
      className={
        "w-80 bg-transparent hover:bg-violet-400 text-grey-900 font-semibold hover:text-white py-2 px-4 border border-violet-400 hover:border-transparent rounded"
      }
    >
      Add to Shortlist
    </Button>
  );
}

function ShortlistTooltip() {
  return (
    <span className="flex items-center justify-center mt-2">
      <InformationCircleIcon
        data-tip
        data-background-color="#0E0333"
        data-for="shortlist-tooltip"
        className="inline h-4 w-4 ml-2 mr-3"
        data-testid={"shortlist-tooltip"}
      />
      <ReactTooltip
        id="shortlist-tooltip"
        place="bottom"
        type="dark"
        effect="solid"
      >
        <p className="text-xs">
          This interactive tool allows you to <br />
          visualize how you distribute your <br />
          impact across projects as you make <br />
          your decisions. Adjust as you go and
          <br />
          then decide when you're ready to <br />
          submit your final choices.
          <br />
        </p>
      </ReactTooltip>
      <p className={"text-base font-normal text-black"}>
        What is the Shortlist?
      </p>
    </span>
  );
}

function ScollComponent(props: { handleClickScroll: () => void }) {
  return (
    <div className="fixed bottom-10 right-2">
      <Button className="py-2 px-2" onClick={props.handleClickScroll}>
        <PushLogo />
      </Button>
    </div>
  );
}

function vcProviderMatchesProject(
  provider: string,
  verifiableCredential: VerifiableCredential,
  project: Project | undefined
) {
  let vcProviderMatchesProject = false;
  if (provider === "twitter") {
    vcProviderMatchesProject =
      verifiableCredential.credentialSubject.provider
        ?.split("#")[1]
        .toLowerCase() ===
      project?.projectMetadata.projectTwitter?.toLowerCase();
  } else if (provider === "github") {
    vcProviderMatchesProject =
      verifiableCredential.credentialSubject.provider
        ?.split("#")[1]
        .toLowerCase() ===
      project?.projectMetadata.projectGithub?.toLowerCase();
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
  project: Project | undefined
) {
  const vcHasValidProof = await verifier.verifyCredential(verifiableCredential);
  const vcIssuedByValidIAMServer = verifiableCredential.issuer === IAM_SERVER;
  const providerMatchesProject = vcProviderMatchesProject(
    provider,
    verifiableCredential,
    project
  );
  const vcIssuedToAtLeastOneProjectOwner = (
    project?.projectMetadata?.owners ?? []
  ).some((owner) => vcIssuedToAddress(verifiableCredential, owner.address));

  return vcHasValidProof &&
    vcIssuedByValidIAMServer &&
    providerMatchesProject &&
    vcIssuedToAtLeastOneProjectOwner
    ? VerifiedCredentialState.VALID
    : VerifiedCredentialState.INVALID;
}
