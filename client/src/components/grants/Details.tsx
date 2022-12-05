import { Box } from "@chakra-ui/react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchProjectApplications } from "../../actions/projects";
import { RootState } from "../../reducers";
import colors from "../../styles/colors";
import { FormInputs, Metadata, Project } from "../../types";
import Calendar from "../icons/Calendar";
import LinkIcon from "../icons/LinkIcon";
import Shield from "../icons/Shield";
import ApplicationCard from "./ApplicationCard";

function Verified() {
  return (
    <div className="flex rounded bg-green-text/25 px-2 py-0.5 mt-1">
      <Shield dimension={16} color={colors["green-text"]} />{" "}
      <p className="pl-2 text-green-text text-xs font-bold">Verified</p>
    </div>
  );
}

export default function Details({
  project,
  createdAt,
  updatedAt,
  bannerImg,
  logoImg,
  showApplications,
}: {
  project?: Metadata | FormInputs | Project;
  updatedAt: string;
  createdAt: string;
  bannerImg: string | Blob;
  logoImg: string | Blob;
  showApplications: boolean;
}) {
  const params = useParams();
  const dispatch = useDispatch();
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

  useEffect(() => {
    if (props.projectID) {
      dispatch(
        fetchProjectApplications(props.projectID, Number(props.chainId))
      );
    }
  }, [dispatch, props.projectID, props.chainId]);

  const renderApplications = () => (
    <>
      <Box p={1}>
        <span className="text-[20px]">My Applications</span>
      </Box>
      <Box>
        {props.applications.map((application) => {
          const roundID = application?.roundID;
          const cardData = { application, roundID, chainId: props.chainId };
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
    <div className="w-full mb-40">
      <img
        className="w-full mb-4"
        src={
          bannerImg instanceof Blob ? URL.createObjectURL(bannerImg) : bannerImg
        }
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "./assets/default-project-logo.png";
        }}
        alt="project banner"
      />
      <div className="relative">
        <div className="flex w-full justify-start absolute -top-14 left-8">
          <div className="rounded-full h-20 w-20 bg-quaternary-text border border-tertiary-text flex justify-center items-center">
            <img
              className="rounded-full"
              src={
                logoImg instanceof Blob ? URL.createObjectURL(logoImg) : logoImg
              }
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "./assets/default-project-logo.png";
              }}
              alt="project logo"
            />
          </div>
        </div>
      </div>
      <h4 className="mb-4 ml-1 mt-14">{project?.title}</h4>
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
                    src="./assets/twitter_logo.svg"
                    alt="Twitter Logo"
                  />
                  <a
                    className="mr-2 text-primary-background"
                    target="_blank"
                    href={`https://twitter.com/${project?.projectTwitter}`}
                    rel="noreferrer"
                  >
                    {project?.projectTwitter}
                  </a>
                  {project?.credentials?.twitter && <Verified />}
                </div>
              )}
              {project?.projectGithub && (
                <div className="flex justify-start items-center m-2">
                  <img
                    className="h-4 mr-2"
                    src="./assets/github_logo.png"
                    alt="Github Logo"
                  />
                  <a
                    className="mr-2 text-primary-background"
                    target="_blank"
                    href={`https://github.com/${project?.projectGithub}`}
                    rel="noreferrer"
                  >
                    {project?.projectGithub}
                  </a>
                  {project?.credentials?.github && <Verified />}
                </div>
              )}
            </div>
            <div>
              <div>
                <p className="flex text-sm m-2 pb-2">
                  <Calendar color={colors["secondary-text"]} />
                  <span className="ml-1">Created on: {createdAt}</span>
                </p>
              </div>
              <div>
                <p className="flex text-sm m-2 pb-1">
                  <Calendar color={colors["secondary-text"]} />
                  <span className="ml-1">Last Edited: {updatedAt}</span>
                </p>
              </div>
              {project?.projectGithub && (
                <div className="flex items-center m-2">
                  <img
                    className="h-4 ml-0.5 mr-2 mt-1"
                    src="./assets/github_logo.png"
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
            <div className="mb-12 ml-2">
              {project?.description?.split(/\r?\n/).map((i, x) => (
                // eslint-disable-next-line react/no-array-index-key
                <p className="mb-5" key={`i-${x}`}>
                  {i}
                </p>
              ))}
            </div>
          </div>
        </div>
        {canShowApplications && (
          <div className="max-w-md w-full hidden md:flex flex-col">
            {renderApplications()}
          </div>
        )}
      </div>
    </div>
  );
}
