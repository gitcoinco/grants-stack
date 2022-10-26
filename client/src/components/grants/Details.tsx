import { Box, SimpleGrid } from "@chakra-ui/react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getRoundProjectsApplied } from "../../actions/projects";
import { RootState } from "../../reducers";
import colors from "../../styles/colors";
import { FormInputs, Metadata, Project } from "../../types";
import generateUniqueRoundApplicationID from "../../utils/roundApplication";
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
  preview,
}: {
  project?: Metadata | FormInputs | Project;
  updatedAt: string;
  createdAt: string;
  bannerImg: string | Blob;
  logoImg: string | Blob;
  preview?: boolean;
}) {
  const params = useParams();
  const dispatch = useDispatch();
  const props = useSelector((state: RootState) => {
    const chainId = state.web3.chainID;
    const projectID = generateUniqueRoundApplicationID(
      chainId!,
      Number(params.id)
    );
    const { applications } = state.projects;
    // todo: get the round id and sort the projects by round id
    // const roundState = state.rounds[roundId!];
    // const round = roundState ? roundState.round : undefined;

    return {
      chainId,
      projectID,
      applications,
    };
  });

  props.applications.map((application) =>
    console.log("application", application)
  );

  useEffect(() => {
    dispatch(getRoundProjectsApplied(props.projectID, props.chainId!));
  }, [dispatch, props.projectID, props.chainId]);

  console.log("Props from details => ", props);

  return (
    <div className={`w-full ${preview && "md:w-2/3"} mb-40`}>
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
      <h4 className="mb-4 mt-14">{project?.title}</h4>
      <SimpleGrid
        className="pb-6 mb-6"
        templateColumns="repeat(3, 1fr)"
        minChildWidth="200px"
        gap={6}
      >
        <Box>
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
        </Box>
        <Box>
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
        </Box>
        <Box>
          <Box p={1}>
            <span className="text-[20px]">My Applications</span>
          </Box>
          <ApplicationCard props={props} />
        </Box>
      </SimpleGrid>
      <p className="text-primary-text mb-1 font-bold">Description</p>
      <p className="mb-12">{project?.description}</p>
    </div>
  );
}
