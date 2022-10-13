import { datadogLogs } from "@datadog/browser-logs";
import { Link, useParams } from "react-router-dom";
import { useRoundById } from "../../context/RoundContext";
import { ProjectBanner } from "../common/ProjectBanner";
import DefaultLogoImage from "../../assets/default_logo.png";
import { ProjectMetadata } from "../api/types";
import { ChevronLeftIcon } from "@heroicons/react/solid";
import { Button } from "../common/styles";
import { useBallot } from "../../context/BallotContext";
import Navbar from "../common/Navbar";

export default function ViewProjectDetails() {
  datadogLogs.logger.info(
    "====> Route: /round/:chainId/:roundId/:applicationId"
  );
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);
  const { chainId, roundId, applicationId } = useParams();
  const { round, isLoading } = useRoundById(chainId!, roundId!);
  const projectToRender = round?.approvedProjects?.find(
    (project) => project.grantApplicationId === applicationId
  );

  console.log("chainId", chainId);
  console.log("roundId", roundId);
  console.log("applicationId", applicationId);

  const [shortlist, addProjectToShortlist, removeProjectFromShortlist] = useBallot();
  console.log("shortlist", shortlist);
  const isAddedToBallot = shortlist.some(
    (project) => project.grantApplicationId === applicationId
  );

  return (
    <>
      <div className="mx-20 h-screen px-4 py-7">
      <Navbar />
        <div className="flex flex-row items-center gap-3 text-sm">
          <ChevronLeftIcon className="h-6 w-6 mt-6 mb-6" />
          <Link to={`/round/${chainId}/${roundId}`}>
            <span className="font-normal text-purple-100">Back to Grants</span>
          </Link>
        </div>
        {!isLoading && projectToRender && (
          <>
            <Header projectMetadata={projectToRender.projectMetadata} />
            <div className="flex">
              <div className="grow">
                <div>
                  <ProjectTitle
                    projectMetadata={projectToRender.projectMetadata}
                  />
                  <AboutProject projectToRender={projectToRender} />
                </div>
                <div>
                  <DescriptionTitle />
                  <Detail text={projectToRender.projectMetadata.description} />
                </div>
              </div>
              <Sidebar
                addedToBallot={isAddedToBallot}
                removeFromBallot={() => {
                  removeProjectFromShortlist(projectToRender);
                }}
                addToBallot={() => {
                  addProjectToShortlist(projectToRender);
                }}
              />
            </div>
          </>
        )}
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
      <h1 className="text-3xl mt-6 font-thin text-purple-100">
        {props.projectMetadata.title}
      </h1>
    </div>
  );
}

function AboutProject(props: { projectToRender: any }) {
  return (
    <div className="border-b-2 pt-2 pb-6">
      <Detail text={props.projectToRender.projectMetadata.website} />
      <Detail
        text={`@${props.projectToRender.projectMetadata.projectTwitter!}`}
      />
    </div>
  );
}

function DescriptionTitle() {
  return (
    <h1 className="text-2xl mt-8 font-thin text-purple-100">
      Project Description
    </h1>
  );
}

function Detail(props: { text: string }) {
  return (
    <p className="text-base font-normal text-purple-100 mt-4">{props.text}</p>
  );
}

export function ProjectLogo(props: {
  projectMetadata: ProjectMetadata;
  classNameOverride?: string;
}) {
  const applicationLogoImage = props.projectMetadata!.logoImg
    ? `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${props.projectMetadata.logoImg}`
    : DefaultLogoImage;

  return (
    <div className="pl-4">
      <div className="-mt-6 sm:-mt-6 sm:flex sm:items-end sm:space-x-5">
        <div className="flex">
          <img
            className={
              props.classNameOverride ??
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
  addedToBallot: boolean;
  removeFromBallot: () => void;
  addToBallot: () => void;
}) {
  return (
    <div className="ml-6">
      <BallotSelectionToggle
        isAddedToBallot={props.addedToBallot}
        removeFromBallot={props.removeFromBallot}
        addToBallot={props.addToBallot}
      />
    </div>
  );
}

function BallotSelectionToggle(props: {
  isAddedToBallot: boolean;
  addToBallot: () => void;
  removeFromBallot: () => void;
}) {
  return (
    <>
      {props.isAddedToBallot ? (
        <Button
          data-testid="remove-from-ballot"
          onClick={props.removeFromBallot}
        >
          Remove from ballot
        </Button>
      ) : (
        <Button data-testid="add-to-ballot" onClick={props.addToBallot}>
          Back this project
        </Button>
      )}
    </>
  );
}
