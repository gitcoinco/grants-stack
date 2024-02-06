import { GlobeAltIcon } from "@heroicons/react/24/solid";
import { ChainId } from "common";
import {
  RoundApplicationAnswers,
  RoundApplicationQuestion,
} from "data-layer/dist/roundApplication.types";
import { useEnsName } from "wagmi";
import { GithubLogo, TwitterLogo } from "../../assets";
import useValidateCredential from "../../hooks/useValidateCredential";
import colors from "../../styles/colors";
import { Metadata } from "../../types";
import { getPayoutIcon } from "../../utils/wallet";
import GreenVerifiedBadge from "../badges/GreenVerifiedBadge";
import Calendar from "../icons/Calendar";
import { DetailSummary } from "./DetailSummary";

export function AboutProject(props: {
  projectToRender: Metadata;
  questions: RoundApplicationQuestion[];
  answers: RoundApplicationAnswers;
  chainId: ChainId;
}) {
  const { projectToRender, answers, questions, chainId } = props;

  const { website, projectTwitter, projectGithub, userGithub, credentials } =
    projectToRender;

  const { isValid: validTwitterCredential } = useValidateCredential(
    credentials?.twitter,
    projectTwitter
  );

  const { isValid: validGithubCredential } = useValidateCredential(
    credentials?.github,
    projectGithub
  );

  const recipientQuestion = questions.find((item) => item.type === "recipient");
  const recipient = recipientQuestion
    ? answers[recipientQuestion.id.toString()].toString()
    : undefined;

  const { data: ensName } = useEnsName({
    address: (recipient ?? "") as `0x${string}`,
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 pt-2 pb-6">
      {recipient && (
        <span className="flex items-center mt-4 gap-1">
          <div className="w-5 h-5 rounded-full overflow-hidden">
            <img
              src={getPayoutIcon(chainId)}
              alt="circle"
              className="w-full h-full object-cover"
            />
          </div>
          <DetailSummary
            text={`${
              ensName || `${recipient.slice(0, 6)}...${recipient.slice(-4)}`
            }`}
            testID="project-recipient"
            sm
          />
        </span>
      )}
      {projectToRender.createdAt && (
        <span className="flex items-center mt-4 gap-2">
          {/* <CalendarIcon className="h-4 w-4 mr-1 opacity-80" /> */}
          <Calendar color={colors["secondary-text"]} />
          <DetailSummary
            text={`Created: ${new Date(
              projectToRender.createdAt
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}`}
            testID="project-createdAt"
          />
        </span>
      )}
      {website && (
        <span className="flex items-center mt-4 gap-1">
          <GlobeAltIcon className="h-4 w-4 mr-1 opacity-40" />
          <a
            href={website}
            target="_blank"
            rel="noreferrer"
            className="text-base font-normal text-black"
          >
            <DetailSummary
              text={`${website}`}
              testID="project-website"
              violetcolor
            />
          </a>
        </span>
      )}
      {projectTwitter && (
        <span className="flex items-center mt-4 gap-1">
          <img src={TwitterLogo} className="h-4" alt="Twitter Logo" />
          <a
            href={`https://twitter.com/${projectTwitter}`}
            target="_blank"
            rel="noreferrer"
            className="text-base font-normal text-black"
          >
            <DetailSummary
              text={projectTwitter}
              testID="project-twitter"
              violetcolor
            />
          </a>
          {validTwitterCredential && <GreenVerifiedBadge />}
        </span>
      )}
      {userGithub && (
        <span className="flex items-center mt-4 gap-2">
          <img src={GithubLogo} className="h-4" alt="GitHub Logo" />
          <a
            href={`https://github.com/${userGithub}`}
            target="_blank"
            rel="noreferrer"
            className="text-base font-normal text-black"
          >
            <DetailSummary
              text={`${userGithub}`}
              testID="user-github"
              violetcolor
            />
          </a>
          {validGithubCredential && <GreenVerifiedBadge />}
        </span>
      )}
      {projectGithub && (
        <span className="flex items-center mt-4 gap-1">
          <img src={GithubLogo} className="h-4" alt="GitHub Logo" />
          <a
            href={`https://github.com/${projectGithub}`}
            target="_blank"
            rel="noreferrer"
            className="text-base font-normal text-black"
          >
            <DetailSummary
              text={`${projectGithub}`}
              testID="project-github"
              violetcolor
            />
          </a>
        </span>
      )}
    </div>
  );
}
