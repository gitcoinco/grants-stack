import { Box } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { GithubLogo, TwitterLogo } from "../../assets";
import useValidateCredential from "../../hooks/useValidateCredential";
import { RootState } from "../../reducers";
import colors from "../../styles/colors";
import { CredentialProvider, FormInputs, Metadata, Project } from "../../types";
import { formatDateFromMs } from "../../utils/components";
import markdown from "../../utils/markdown";
import Calendar from "../icons/Calendar";
import LinkIcon from "../icons/LinkIcon";
import Shield from "../icons/Shield";
import ApplicationCard from "./ApplicationCard";

function Verified() {
  return (
    <div className="flex rounded bg-green-text/25 px-2 py-0.5 mt-1">
      <Shield dimension={16} color={colors["green-text"]} />{" "}
      <p className="pl-2 text-green-text text-xs font-normal mt-0.5">
        Verified
      </p>
    </div>
  );
}

export default function About({
  project,
  showApplications,
  createdAt,
  updatedAt,
}: {
  project?: Metadata | FormInputs | Project;
  showApplications: boolean;
  createdAt: number;
  updatedAt: number;
}) {
  const params = useParams();
  const props = useSelector((state: RootState) => {
    const { chainId } = params;

    const applications = state.projects.applications[params.id!] || [];

    return {
      chainId,
      projectID: params.id!,
      applications,
    };
  });

  const canShowApplications =
    props.applications.length !== 0 && showApplications;

  const validTwitterCredential: boolean = useValidateCredential(
    project?.credentials?.twitter,
    CredentialProvider.Twitter,
    project?.projectTwitter
  );

  const validGithubCredential: boolean = useValidateCredential(
    project?.credentials?.github,
    CredentialProvider.Github,
    project?.projectGithub
  );

  const renderApplications = () => (
    <>
      <Box p={1}>
        <span className="text-[20px]">My Applications</span>
      </Box>
      <Box>
        {props.applications.map((application) => {
          const roundID = application?.roundID;
          const cardData = {
            application,
            roundID,
            chainId: application.chainId,
          };
          return (
            <Box key={roundID} m={2}>
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
                {validTwitterCredential && <Verified />}
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
                {validGithubCredential && <Verified />}
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
            {project?.projectGithub && (
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
          <p className="text-primary-text ml-2 xl:mt-2 lg:mt-2 font-bold">
            Description
          </p>
          <div className="pt-6 mb-12 ml-2 prose prose-h1:text-lg prose-h2:text-base prose-h3:text-base">
            {project?.description && (
              <div
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: markdown.renderToHTML(project.description),
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
