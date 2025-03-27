import { ReactComponent as GithubIcon } from "../../../../assets/github-logo.svg";
import { ReactComponent as TwitterIcon } from "../../../../assets/twitter-logo.svg";
import { ReactComponent as EthereumIcon } from "common/src/assets/ethereum-icon.svg";
import { ReactComponent as GlobeIcon } from "../../../../assets/icons/globe-icon.svg";
import { Project } from "../../../api/types";
import { formatDateWithOrdinal, useValidateCredential } from "common";
import { useEnsName } from "wagmi";
import { ProjectLink } from "./ProjectLink";
import CopyToClipboard from "common/src/components/CopyToClipboard";
import { CalendarIcon } from "./CalendarIcon";

export function ProjectLinks({ project }: { project?: Project }) {
  const {
    recipient,
    projectMetadata: {
      createdAt,
      website,
      projectTwitter,
      projectGithub,
      userGithub,
      credentials,
    },
  } = project ?? { projectMetadata: {} };

  // @ts-expect-error Temp until viem (could also cast recipient as Address or update the type)
  const ens = useEnsName({ address: recipient, enabled: Boolean(recipient) });

  const { isValid: validTwitterCredential } = useValidateCredential(
    credentials?.twitter,
    projectTwitter
  );

  const { isValid: validGithubCredential } = useValidateCredential(
    credentials?.github,
    projectGithub
  );

  const createdOn =
    createdAt &&
    `Created on: ${formatDateWithOrdinal(new Date(createdAt ?? 0))}`;

  return (
    <div
      className={`grid md:grid-cols-2 gap-4  border-y-[2px] py-4 my-4 ${
        // isLoading?
        createdAt ? "" : "bg-grey-100 animate-pulse"
      }`}
    >
      <ProjectLink icon={EthereumIcon}>
        <CopyToClipboard text={ens.data || recipient} />
      </ProjectLink>
      <ProjectLink icon={CalendarIcon}>{createdOn}</ProjectLink>
      <ProjectLink url={website} icon={GlobeIcon}>
        {website}
      </ProjectLink>
      {projectTwitter !== undefined && (
        <ProjectLink
          url={`https://twitter.com/${projectTwitter}`}
          icon={TwitterIcon}
          isVerified={validTwitterCredential}
        >
          {projectTwitter}
        </ProjectLink>
      )}
      {projectGithub !== undefined && (
        <ProjectLink
          url={`https://github.com/${projectGithub}`}
          icon={GithubIcon}
          isVerified={validGithubCredential}
        >
          {projectGithub}
        </ProjectLink>
      )}
      {userGithub !== undefined && (
        <ProjectLink url={`https://github.com/${userGithub}`} icon={GithubIcon}>
          {userGithub}
        </ProjectLink>
      )}
    </div>
  );
}
