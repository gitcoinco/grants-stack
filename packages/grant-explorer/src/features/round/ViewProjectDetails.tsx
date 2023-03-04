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
  Round
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
import {
  getUserPgpKeys,
  getGroupChatID,
  verifyPushChatUser,
  createPushGroup,
  joinGroup,
  fetchHistoryMsgs,
  sendMsg,
  getGroupInfo,
  getUserDetails
} from "../api/pushChat";
import useSWR from "swr";
import { add, formatDistanceToNowStrict } from "date-fns";
import RoundEndedBanner from "../common/RoundEndedBanner";
import PassportBanner from "../common/PassportBanner";
import markdown from "../../app/markdown";
import * as PushApi from "@pushprotocol/restapi";
import Auth from "../common/Auth";
import { getQFVotesForProject } from "../api/round";
import { createSocketConnection, EVENTS } from "@pushprotocol/socket";

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
  const [pushChatId, setPushChatID] = useState<string | null>(null);
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
      return;
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
  pushChatId: string | null;
  isAdded: boolean;
  removeFromShortlist: () => void;
  removeFromFinalBallot: () => void;
  addToShortlist: () => void;
  handlePushChatID: any;
  position: string;
  setPosition: any;
  pgpKeys: string;
}) {
  const wallet = Auth();
  const [isPresent, setIsPresent] = useState<boolean>(true);
  const { chainId, roundId, applicationId } = useParams();
  const { round } = useRoundById(chainId!, roundId!);
  const project = round?.approvedProjects?.find(
    (project) => project.grantApplicationId === applicationId
  );

  const { position, setPosition } = props;

  useEffect(() => {
    handlePositions(wallet, project as Project);
  }, []);

  const handlePositions = async (wallet: any, project: Project) => {
    if (!wallet || !project) {
      return;
    }
    const { isMember, isOwner, chatId, isContributor } =
      await verifyPushChatUser(project, wallet);

    if (!chatId) {
      setIsPresent(false);
    }
    if (!isMember && !isOwner) {
      setIsPresent(false);
    }
    if (chatId) {
      props.handlePushChatID(chatId);
    }
    if (isOwner) {
      setPosition("Owner");
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
    if (position === "Owner") {
      const groupChatId = await createPushGroup(
        project as Project,
        wallet.props.context.address,
        round as Round,
      );
      if (!groupChatId) return;
      props.handlePushChatID(groupChatId);
      setPosition("Owner");
      setIsPresent(true);
      handleClickScroll();
      return;
    }
    if (position === "Contributor") {
      const chatId = await joinGroup(
        wallet.props.context.address,
        project as Project
      );
      props.handlePushChatID(null);
      setPosition("Contributor");
      setIsPresent(true);
      handleClickScroll();
      return;
    }
  };

  return (
    <div className="mt-6 md:mt-0 self-center md:self-auto md:ml-6 flex flex-col">
      <ProjectStats />
      {!isPresent && position !== "None" && (
        <Button
          onClick={() => handleGroupCreation()}
          className={
            "w-80 self-center justify-center bg-[#6F3FF5] text-white font-semibold py-2 px-4 border border-[#A283F9] rounded my-2 box-border"
          }
        >
          {position === "Owner"
            ? "Create Group Chat"
            : position === "Contributor"
            ? "Join group"
            : "None"}
        </Button>
      )}
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

export function PushChat(props: {
  pgpKeys: string;
  pushChatId: any;
  position: string;
  setPosition: any;
  handlePushChatID: any;
  handlePgpKeys: any;
}) {
  const { chainId, roundId, applicationId } = useParams();
  const { round } = useRoundById(chainId!, roundId!);
  const project = round?.approvedProjects?.find(
    (project) => project.grantApplicationId === applicationId
  );
  const [msgs, setMsgs] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState<string>("");
  const [isPresent, setIsPreset] = useState<boolean>(false);

  const wallet = Auth();

  useEffect(() => {
    fetchMsgs();
    handleWebSockets();
  }, []);

  useEffect(() => {
    fetchMsgs();
  }, [props.pushChatId]);

  useEffect(() => {
    const scrollDiv = document.getElementById("chat-scroll");
    if (scrollDiv) {
      scrollDiv.scrollTop = 0;
    }
  }, [msgs]);

  const fetchMsgs = async () => {
    if (!wallet.props.context || !project) {
      return;
    }
    const { props: walletProps } = wallet;
    const {
      context: { address },
    } = walletProps;

    const pushChatId =
      (await getGroupChatID(project.projectMetadata.title, address)) || null;
    const chatHistory = await fetchHistoryMsgs(
      address,
      pushChatId as string,
      props.pgpKeys
    );
    const newMsgArr = []
      if(chatHistory.length){
        for(let i =0; i< chatHistory.length ; i++){
          const userDetails = await getUserDetails(chatHistory[i].fromCAIP10)
          newMsgArr.push({
            ...chatHistory[i],
            profile: userDetails
          })
        }
      }
    

    let isMem = false;
    const groupInfo = await getGroupInfo(pushChatId as string, address);
    groupInfo?.members.forEach((mem) => {
      if (mem.wallet === `eip155:${address}`) {
        isMem = true;
      }
    });
    setIsPreset(isMem);
    setMsgs(newMsgArr);
  };

  const handleMsgSent = async () => {
    if (project) {
      const oldMsgs = [...msgs];
      const { props: walletProps } = wallet;
      const {
        context: { address },
      } = walletProps;

      const pushChatId =
        (await getGroupChatID(project.projectMetadata.title, address)) || null;
      const res = await sendMsg(
        inputMsg,
        address,
        props.pgpKeys,
        pushChatId as string
      );

      const profileImage = await getUserDetails(`eip155:${address}`)


      if (res) {
        setMsgs([
          { fromCAIP10: `eip155:${address}`, messageContent: inputMsg, profile: profileImage },
          ...oldMsgs,
        ]);
      }
      setInputMsg("");
    }
  };

  const handleInputMsg = (e: any) => {
    setInputMsg(e.target.value);
  };

  const handleWebSockets = () => {
    const { props: walletProps } = wallet;
    if (!wallet.props.context) {
      return;
    }
    const {
      context: { address },
    } = walletProps;
    const pushSDKSocket = createSocketConnection({
      user: `eip155:${address}`, // Not CAIP-10 format
      env: "dev",
      apiKey:
        "jVPMCRom1B.iDRMswdehJG7NpHDiECIHwYMMv6k2KzkPJscFIDyW8TtSnk4blYnGa8DIkfuacU0",
      socketType: "chat",
      socketOptions: { autoConnect: true, reconnectionAttempts: 3 },
    });

    pushSDKSocket?.on(EVENTS.CHAT_RECEIVED_MESSAGE, async (message) => {
      await fetchMsgs();
    });
  };

  const textBoxLeft = (e: any) => {
    const addOfUser = e.fromCAIP10
      ? `${e.fromCAIP10.substring(7, 12)}...${e.fromCAIP10.substring(
          e.fromCAIP10.length - 5,
          e.fromCAIP10.length
        )} `
      : null;
    return (
      <div className={`flex flex-row`}>
        <div className="flex justify-center align-center rounded-full w-9 h-9 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <img className="rounded-full" src={e.profile} />
        </div>
        <div
          className={`flex flex-col my-2 rounded hover:cursor-pointer ml-2.5 ${
            e.fromCAIP10 === `eip155:${wallet.props.context.address}`
              ? "self-end"
              : "self-start"
          }`}
        >
          <p className="text-xs">{addOfUser}</p>
          <p className="text-sm rounded-tr-2xl border border-solid  rounded-br-2xl rounded-bl-2xl py-1 px-3 pb-3">
            {e.messageContent}
          </p>
        </div>
      </div>
    );
  };

  const textBoxRight = (e: any) => {

    const addOfUser = e.fromCAIP10
      ? `${e.fromCAIP10.substring(7, 12)}...${e.fromCAIP10.substring(
          e.fromCAIP10.length - 5,
          e.fromCAIP10.length
        )} `
      : null;

    return (
      <div className={`flex flex-row self-end`}>
        <div
          className={`flex flex-col my-2 rounded hover:cursor-pointer mr-2.5 self-end`}
        >
          <p className="text-xs text-[#6F3FF5] self-end">{addOfUser}</p>
          <p className="text-xs bg-[#6F3FF5] text-white rounded-tl-2xl border border-solid  rounded-br-2xl rounded-bl-2xl pt-2 px-3 pb-3">
            {e.messageContent}
          </p>
        </div>
        <div className="rounded-full flex justify-center align-center w-9 h-9 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <img className="rounded-full" src={e.profile} />
        </div>
      </div>
    );
  };

  return (
    <div className="py-4 mt-4" id="push-chat">
      <div className="flex flex-row justify-between">
        <h4 className="text-2xl mb-2">Grant Group Chat</h4>
        {!props.pgpKeys && (
          <Button
            className="text-sm px-10 py-2.5"
            onClick={props.handlePgpKeys}
          >
            Decrypt keys to view group chat
          </Button>
        )}
      </div>

      {!props.pgpKeys && (
        <div>Get Decrypted PGP keys first to see the chat!</div>
      )}
      {props.pgpKeys ? (
        props.pushChatId ? (
          // return chats for the user
          <>
            {isPresent && (
              <div className="w-100 flex flex-col relative">
                <div className="border h-16 px-2 rounded-xl relative border-[#DEE2E6]">
                  <input
                    className="pt-0 px-1 h-8 w-full bg-transparent relative z-10 flex flex-row text-xs  outline-none"
                    onChange={(e) => {
                      handleInputMsg(e);
                    }}
                    value={inputMsg}
                    onKeyDown={({ key }) => {
                      if (key === "Enter") handleMsgSent();
                    }}
                  />

                  {!inputMsg.length && (
                    <span className="px-2 absolute top-2 left-2 text-xs text-[#DEE2E6]">
                      Write on a grants group chat...
                    </span>
                  )}
                </div>

                <button
                  onClick={handleMsgSent}
                  className={
                    "self-end bg-[#6F3FF5] mt-3.5 rounded-sm text-white text-xs cursor-pointer px-4 py-2"
                  }
                >
                  Send Message
                </button>
              </div>
            )}
            <div
              id="chat-scroll"
              className="h-96 flex flex-auto flex-col overflow-auto mt-6"
            >
              {msgs?.map((e) => {
                const newAdd = "eip155:" + wallet.props.context.address;
                return newAdd === e.fromCAIP10
                  ? textBoxRight(e)
                  : textBoxLeft(e);
              })}
            </div>
            <div className="flex flex-row"></div>
          </>
        ) : (
          // return no group has present
          <div>Chat group hasn't been created yet!</div>
        )
      ) : null}
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

function ScollComponent(props: { handleClickScroll: any }) {
  return (
    <div className="fixed bottom-10 right-2">
      <Button className="py-2 px-2" onClick={props.handleClickScroll}>
        <PushLogo/>
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
