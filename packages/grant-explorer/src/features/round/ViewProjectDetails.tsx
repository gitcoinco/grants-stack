import { datadogLogs } from "@datadog/browser-logs";
import { Link, useParams } from "react-router-dom";
import { useRoundById } from "../../context/RoundContext";
import { ProjectBanner } from "../common/ProjectBanner";
import DefaultLogoImage from "../../assets/default_logo.png";
import { Project, ProjectMetadata } from "../api/types";
import { ChevronLeftIcon, GlobeAltIcon, LightningBoltIcon } from "@heroicons/react/solid";
import { ReactComponent as TwitterIcon } from "../../assets/twitter-logo.svg";
import { ReactComponent as GithubIcon } from "../../assets/github-logo.svg";
import { Button } from "../common/styles";
import { useBallot } from "../../context/BallotContext";
import Navbar from "../common/Navbar";
import Footer from "../common/Footer";

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

  const [shortlist, addProjectToShortlist, removeProjectFromShortlist] = useBallot();
  const isAddedToBallot = shortlist.some(
    (project) => project.grantApplicationId === applicationId
  );

  return (
    <>
      <Navbar roundUrlPath={`/round/${chainId}/${roundId}`} />
      <div className="mx-20 h-screen px-4 py-7">
        <div className="flex flex-row items-center gap-3 text-sm">
          <ChevronLeftIcon className="h-5 w-5 mt-6 mb-6" />
          <Link to={`/round/${chainId}/${roundId}`}>
            <span className="font-normal">Back to Grants</span>
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
                  <Detail text={projectToRender.projectMetadata.description} testID="project-metadata"/>
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
      <Footer />
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

  const { projectToRender } = props;
  const projectRecipient = projectToRender.recipient.slice(0, 6) + "..." + projectToRender.recipient.slice(-4);
  const projectWebsite = projectToRender.projectMetadata.website;
  const projectTwitter = projectToRender.projectMetadata.projectTwitter;
  const userGithub = projectToRender.projectMetadata.userGithub;
  const projectGithub = projectToRender.projectMetadata.projectGithub;

  return (
    <div className="grid grid-cols-2 border-b-2 pt-2 pb-6">
      {projectRecipient && 
        (<span className="flex items-center mt-4 gap-1">
          <LightningBoltIcon className="h-4 w-4 mr-1 opacity-40" />
          <DetailSummary text={`${projectRecipient}`} testID="project-recipient" sm={true} />
        </span>)
      }
      {projectWebsite && 
        (<span className="flex items-center mt-4 gap-1">
          <GlobeAltIcon className="h-4 w-4 mr-1 opacity-40" />
          <a 
            href={projectWebsite} 
            target="_blank" 
            rel="noreferrer" 
            className="text-base font-normal text-black"
          >
            <DetailSummary text={`${projectWebsite}`} testID="project-website" />
          </a>
        </span>)
      }
      {projectTwitter && 
        (<span className="flex items-center mt-4 gap-1">
          <TwitterIcon className="h-4 w-4 mr-1 opacity-40" />
          <a 
            href={`https://twitter.com/${projectTwitter}`}
            target="_blank" 
            rel="noreferrer" 
            className="text-base font-normal text-black"
          >
            <DetailSummary text={`@${projectTwitter}`} testID="project-twitter" />
          </a>
        </span>)    
      }
      {userGithub && 
        (<span className="flex items-center mt-4 gap-1">
          <GithubIcon className="h-4 w-4 mr-1 opacity-40" />
          <a 
            href={`https://github.com/${userGithub}`}
            target="_blank" 
            rel="noreferrer" 
            className="text-base font-normal text-black"
          >
            <DetailSummary text={`${userGithub}`} testID="user-github" />
          </a>
        </span>)    
      }
      {projectGithub && 
        (<span className="flex items-center mt-4 gap-1">
          <GithubIcon className="h-4 w-4 mr-1 opacity-40" />
          <a 
            href={`https://github.com/${projectGithub}`}
            target="_blank" 
            rel="noreferrer" 
            className="text-base font-normal text-black"
          >
            <DetailSummary text={`${projectGithub}`} testID="project-github" />
          </a>
        </span>)    
      }  
    </div>
  );
}

function DescriptionTitle() {
  return (
    <h1 className="text-2xl mt-8 font-thin text-black">
      About
    </h1>
  );
}

function DetailSummary(props: { text: string, testID: string, sm?: boolean }) {
  return (
    <p className={`${props.sm ? 'text-sm' : 'text-base'} font-normal text-black`} data-testid={props.testID} > {props.text} </p>
  );
}

function Detail(props: { text: string, testID: string }) {
  return (
    <p className="text-base font-normal text-black" data-testid={props.testID} > {props.text} </p>
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
