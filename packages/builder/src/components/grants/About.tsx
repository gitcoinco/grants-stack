import { Box } from "@chakra-ui/react";
import { renderToHTML } from "common";
import { ProjectApplicationWithRound } from "data-layer";
import { GithubLogo, TwitterLogo } from "../../assets";
import useValidateCredential from "../../hooks/useValidateCredential";
import colors from "../../styles/colors";
import {
  ApplicationCardType,
  FormInputs,
  Metadata,
  Project,
} from "../../types";
import { formatDateFromMs } from "../../utils/components";
import GreenVerifiedBadge from "../badges/GreenVerifiedBadge";
import Calendar from "../icons/Calendar";
import LinkIcon from "../icons/LinkIcon";
import ApplicationCard from "./ApplicationCard";

export default function About({
  project,
  applications,
  showApplications,
  createdAt,
  updatedAt,
}: {
  project?: Metadata | FormInputs | Project;
  applications: ProjectApplicationWithRound[];
  showApplications: boolean;
  createdAt: number;
  updatedAt: number;
}) {
  const canShowApplications = applications.length !== 0 && showApplications;

  const { isValid: validTwitterCredential } = useValidateCredential(
    project?.credentials?.twitter,
    project?.projectTwitter
  );

  const { isValid: validGithubCredential } = useValidateCredential(
    project?.credentials?.github,
    project?.projectGithub
  );

  const renderApplications = () => (
    <>
      <Box p={1}>
        <span className="text-[20px]">My Applications</span>
      </Box>
      <Box>
        {applications.map((application, index) => {
          const roundID = application?.roundId;
          const cardData: ApplicationCardType = {
            application,
            roundID,
            chainId: application.chainId,
          };

          return (
            <Box key={[roundID, index].join("-")} m={2}>
              <ApplicationCard applicationData={cardData} />
            </Box>
          );
        })}
      </Box>
    </>
  );

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <div className="flex flex-1 flex-col w-full">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div>
            <div>
              <a
                target="_blank"
                href={project?.website}
                className="flex items-center mr-6 text-primary-background m-2 pb-1"
                rel="noreferrer"
              >
                <LinkIcon color={colors["secondary-text"]} />{" "}
                <span className="ml-1">{project?.website}</span>
              </a>
            </div>
            {project?.projectTwitter && (
              <div className="flex justify-start items-center m-2 pb-1">
                <img
                  className="h-3 mr-2 mt-1"
                  src={TwitterLogo}
                  alt="Twitter Logo"
                />
                <a
                  className="mr-2 mt-1 text-primary-background"
                  target="_blank"
                  href={`https://twitter.com/${project?.projectTwitter}`}
                  rel="noreferrer"
                >
                  {project?.projectTwitter}
                </a>
                {validTwitterCredential && <GreenVerifiedBadge />}
              </div>
            )}
            {project?.projectGithub && (
              <div className="flex justify-start items-center m-2">
                <img className="h-4 mr-2" src={GithubLogo} alt="Github Logo" />
                <a
                  className="mr-2 text-primary-background"
                  target="_blank"
                  href={`https://github.com/${project?.projectGithub}`}
                  rel="noreferrer"
                >
                  {project?.projectGithub}
                </a>
                {validGithubCredential && <GreenVerifiedBadge />}
              </div>
            )}
          </div>
          <div>
            <div>
              <p className="flex text-sm m-2 pb-2">
                <Calendar color={colors["secondary-text"]} />
                <span className="ml-1">
                  Created on: {formatDateFromMs(createdAt)}
                </span>
              </p>
            </div>
            <div>
              <p className="flex text-sm m-2 pb-1">
                <Calendar color={colors["secondary-text"]} />
                <span className="ml-1">
                  Last Edited: {formatDateFromMs(updatedAt)}
                </span>
              </p>
            </div>
            {project?.userGithub && (
              <div className="flex items-center m-2">
                <img
                  className="h-4 ml-0.5 mr-2 mt-1"
                  src={GithubLogo}
                  alt="Github Logo"
                />
                <a
                  className="text-primary-background"
                  target="_blank"
                  href={`https://github.com/${project?.userGithub}`}
                  rel="noreferrer"
                >
                  {project?.userGithub}
                </a>
              </div>
            )}
          </div>
        </div>
        {canShowApplications && (
          <div className="flex flex-1 md:hidden flex-col">
            {renderApplications()}
          </div>
        )}
        <div className="mt-4">
          <div className="mb-12 ml-2 prose prose-h1:text-lg prose-h2:text-base prose-h3:text-base prose-a:text-blue-600">
            <div className="text-sm">Description</div>
            {project?.description && (
              <div
                className="pr-4"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: renderToHTML(
                    project.description.replace(/\n/g, "\n\n")
                  ),
                }}
              />
            )}
          </div>
        </div>
      </div>
      {canShowApplications && (
        <div className="max-w-md w-full hidden md:flex flex-col">
          {renderApplications()}
        </div>
      )}
    </div>
  );
}
