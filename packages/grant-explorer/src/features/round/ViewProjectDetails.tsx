import { datadogLogs } from "@datadog/browser-logs";
import { Link, useParams } from "react-router-dom";
import { useRoundById } from "../../context/RoundContext";
import { ProjectBanner } from "../common/ProjectBanner";
import DefaultLogoImage from "../../assets/default_logo.png";
import { Project, ProjectMetadata } from "../api/types";
import { ChevronLeftIcon, GlobeAltIcon, LightningBoltIcon, InformationCircleIcon } from "@heroicons/react/solid";
import { ReactComponent as TwitterIcon } from "../../assets/twitter-logo.svg";
import { ReactComponent as GithubIcon } from "../../assets/github-logo.svg";
import { Button } from "../common/styles";
import { useBallot } from "../../context/BallotContext";
import Navbar from "../common/Navbar";
import Footer from "../common/Footer";
import ReactTooltip from "react-tooltip";
import { useState } from "react";

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

  const [shortlist, finalBallot, handleAddProjectsToShortlist, handleRemoveProjectsFromShortlist, , handleRemoveProjectsFromFinalBallot, ] = useBallot();
  const isAddedToShortlist = shortlist.some(
    (project) => project.grantApplicationId === applicationId
  );
  const isAddedToFinalBallot = finalBallot.some(
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
                isAdded={isAddedToShortlist || isAddedToFinalBallot}
                removeFromShortlist={() => {
                  handleRemoveProjectsFromShortlist([projectToRender]);
                }}
                removeFromFinalBallot={() => {
                  handleRemoveProjectsFromFinalBallot([projectToRender]);}
                }
                addToShortlist={() => {
                  handleAddProjectsToShortlist([projectToRender]);
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
  isAdded: boolean;
  removeFromShortlist: () => void;
  removeFromFinalBallot: () => void;
  addToShortlist: () => void;
}) {
  return (
    <div className="ml-6">
      <BallotSelectionToggle
        isAdded={props.isAdded}
        removeFromShortlist={props.removeFromShortlist}
        removeFromFinalBallot={props.removeFromFinalBallot}
        addToBallot={props.addToShortlist}
      />
        <ShortlistTooltip />
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
    const [shortlist, finalBallot, , , , , ] = useBallot();

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
                  className={"w-80 bg-transparent hover:bg-red-500 text-red-400 font-semibold hover:text-white py-2 px-4 border border-red-400 hover:border-transparent rounded"}
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
                    className={"w-80 bg-transparent hover:bg-red-500 text-red-400 font-semibold hover:text-white py-2 px-4 border border-red-400 hover:border-transparent rounded"}
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
            className={"w-80 bg-transparent hover:bg-violet-400 text-grey-900 font-semibold hover:text-white py-2 px-4 border border-violet-400 hover:border-transparent rounded"}>
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
                  This interactive tool allows you to  <br />
                  visualize how you distribute your <br />
                  impact across projects as you make <br />
                  your decisions. Adjust as you go and<br />
                  then decide when you're ready to <br />
                  submit your final choices.<br />
              </p>
            </ReactTooltip>
            <p className={'text-base font-normal text-black'}>What is the Shortlist?</p>
      </span>
  );
}
