import { useBallot } from "../context/BallotContext";
import { Project } from "./api/types";
import { useRoundById } from "../context/RoundContext";
import { Link, useParams } from "react-router-dom";
import Navbar from "./common/Navbar";
import DefaultLogoImage from "../assets/default_logo.png";
import { ChevronLeftIcon } from "@heroicons/react/solid";
import { ArrowCircleLeftIcon, TrashIcon } from "@heroicons/react/outline";
import { Button, Input } from "./common/styles";
import React, { useEffect, useState } from "react";

export default function ViewBallot() {
  const { chainId, roundId } = useParams();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  useRoundById(chainId!, roundId!);

  const [shortlistSelect, setShortlistSelect] = useState(false);
  const [selected, setSelected] = useState<Project[]>([]);

  const [shortlist, , , finalBallot] = useBallot();

  const shortlistNotEmpty = shortlist.length > 0;
  const finalBallotNotEmpty = finalBallot.length > 0;

  useEffect(() => {
    if (!shortlistSelect) {
      setSelected([]);
    }
  }, [shortlistSelect]);

  return (
    <>
      <Navbar roundUrlPath={`/round/${chainId}/${roundId}`} />

      <div className="mx-20 h-screen px-4 py-7">
        {Header(chainId, roundId)}

        <div className="grid grid-cols-2 gap-4">
          {shortlistNotEmpty && ShortlistProjects(shortlist)}
          {!shortlistNotEmpty && EmptyShortlist(chainId, roundId)}

          {finalBallotNotEmpty && FinalBallotProjects(finalBallot)}
          {!finalBallotNotEmpty && EmptyFinalBallot()}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div></div>
          <div>
            {Summary()}

            <Button
              $variant="solid"
              type="button"
              className="items-center shadow-sm text-sm rounded w-full opacity-50"
            >
              Submit your donation!
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  function Header(chainId?: string, roundId?: string) {
    return (
      <div>
        <div className="flex flex-row items-center gap-3 text-sm">
          <ChevronLeftIcon className="h-5 w-5 mt-6 mb-6" />
          <Link to={`/round/${chainId}/${roundId}`}>
            <span className="font-normal">Back</span>
          </Link>
        </div>

        <h1 className="text-3xl mt-6 font-thin border-b-2 pb-2">
          Donation Builder
        </h1>

        <p className="my-4">
          Select your favorite projects from the Shortlist to build your Final
          Donation.
        </p>
      </div>
    );
  }

  function ShortlistProjects(shortlist: Project[]) {
    return (
      <div className="block p-6 rounded-lg shadow-lg bg-white border">
        <div className="flex justify-between border-b-2 pb-2">
          <h2 className="text-xl">Shortlist</h2>
          {shortlistSelect ? (
            <SelectActive onClick={() => setShortlistSelect(false)} />
          ) : (
            <SelectInactive onClick={() => setShortlistSelect(true)} />
          )}
        </div>

        <div className="my-4">
          {shortlist.map((project: Project, key: number) => {
            return (
              <ShortlistProject
                isSelected={
                  isProjectAlreadySelected(project.projectRegistryId) > -1
                }
                project={project}
                key={key}
              />
            );
          })}
        </div>
      </div>
    );
  }

  function ShortlistProject(
    props: React.ComponentProps<"div"> & {
      project: Project;
      isSelected: boolean;
    }
  ) {
    const [, , removeProjectFromShortlist] = useBallot();

    return (
      <div
        data-testid="project"
        className="border-b-2 border-grey-100"
        onClick={() => toggleSelection(props.project)}
      >
        <div
          className={`mb-4 flex justify-between px-3 py-4 rounded-md
            ${props.isSelected ? "bg-violet-100" : ""}`}
        >
          <div className="flex">
            <img
              className="h-[64px]"
              src={
                props.project.projectMetadata.logoImg
                  ? `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${props.project.projectMetadata.logoImg}`
                  : DefaultLogoImage
              }
              alt={"Project Logo"}
            />

            <div className="pl-4 mt-1">
              <p className="font-semibold mb-2">
                {props.project.projectMetadata.title}
              </p>
              <p className="text-sm">
                {props.project.projectMetadata.description}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <TrashIcon
              data-testid="remove-from-shortlist"
              onClick={() => removeProjectFromShortlist(props.project)}
              className="w-6 h-6"
            />
          </div>
        </div>
      </div>
    );
  }

  function EmptyShortlist(chainId?: string, roundId?: string) {
    return (
      <>
        <div className="block p-6 rounded-lg shadow-lg bg-white border">
          <h2 className="text-xl border-b-2 pb-2">Shortlist</h2>

          <div className="my-4">
            <p className="text-grey-500 font-light">
              Projects that you add to the shortlist will appear here.
            </p>
          </div>

          <div className="flex justify-center">
            <Link to={"/round/" + chainId + "/" + roundId}>
              <Button
                $variant="solid"
                type="button"
                className="inline-flex items-center shadow-sm text-sm rounded"
              >
                Browse Projects
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  function FinalBallotProjects(finalBallot: Project[]) {
    return (
      <div className="block p-6 rounded-lg shadow-lg bg-white border">
        <div className="flex justify-between border-b-2 pb-2">
          <h2 className="text-xl">Final Donation</h2>
        </div>
        <div className="my-4">
          {finalBallot.map((project: Project, key: number) => {
            return (
              <FinalBallotProject
                isSelected={
                  isProjectAlreadySelected(project.projectRegistryId) > -1
                }
                project={project}
                key={key}
              />
            );
          })}
        </div>
      </div>
    );
  }

  function FinalBallotProject(
    props: React.ComponentProps<"div"> & {
      project: Project;
      isSelected: boolean;
    }
  ) {

    const [, , , , , handleRemoveFromFinalBallot] = useBallot();

    return (
      <div
        data-testid="finalBallot-project"
        className="border-b-2 border-grey-100"
      >
        <div
          className={`mb-4 flex justify-between px-3 py-4 rounded-md
            ${props.isSelected ? "bg-violet-100" : ""}`}
        >
          <div className="flex">
            <img
              className="h-[64px]"
              src={
                props.project.projectMetadata.logoImg
                  ? `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${props.project.projectMetadata.logoImg}`
                  : DefaultLogoImage
              }
              alt={"Project Logo"}
            />

            <div className="pl-4 mt-1">
              <p className="font-semibold mb-2">
                {props.project.projectMetadata.title}
              </p>
              <p className="text-sm">
                {props.project.projectMetadata.description}
              </p>
            </div>
          </div>

          <div className="mt-1 flex space-x-4">
            <Input
              type="number"
              className="w-24"
            />
            <p className="m-auto">DAI</p>
            <ArrowCircleLeftIcon
              data-testid="remove-from-finalBallot"
              onClick={() => handleRemoveFromFinalBallot(props.project)}
              className="w-6 h-6 m-auto"
            />
          </div>
        </div>
      </div>
    );
  }

  function EmptyFinalBallot() {
    return (
      <>
        <div className="block p-6 rounded-lg shadow-lg bg-white border border-violet-400">
          <h2 className="text-xl border-b-2 pb-2">Final Donation</h2>

          <div className="mt-4">
            <p className="text-grey-500">
              Add the projects you want to fund here!
            </p>
          </div>
        </div>
      </>
    );
  }

  function Summary() {
    return (
      <>
        <div className="my-5 block p-6 rounded-lg shadow-lg bg-white border border-violet-400 font-semibold">
          <h2 className="text-xl border-b-2 pb-2">Summary</h2>

          <div className="flex justify-between mt-4">
            <p>Your Contribution</p>
            <p>000.00 DAI</p>
          </div>
        </div>
      </>
    );
  }

  function SelectInactive(props: { onClick: () => void }) {
    return (
      <Button
        type="button"
        $variant="solid"
        className="text-xs bg-grey-150 px-4 py-2 text-black"
        onClick={props.onClick}
      >
        Select
      </Button>
    );
  }

  function SelectActive(props: { onClick: () => void }) {
    const [, , , , handleAddtoFinalBallot, ] =  useBallot();
    return (
      <Button
        type="button"
        $variant="solid"
        className="text-xs px-4 py-2"
        onClick={props.onClick}
        data-testid="select"
      >
        {selected.length > 0 ? (
          <div data-testid="move-to-finalBallot" onClick={() => handleAddtoFinalBallot(selected)}>
            Add selected ({selected.length}) to Final Donation
          </div>
        ) : (
          <>Select</>
        )}
      </Button>
    );
  }

  function toggleSelection(project: Project) {
    // toggle works when select is active
    if (!shortlistSelect) return;

    const newState = [...selected];

    const projectIndex = isProjectAlreadySelected(project.projectRegistryId);

    if (projectIndex < 0) {
      newState.push(project);
    } else {
      newState.splice(projectIndex, 1);
    }

    setSelected(newState);

    // disable select button if no projects are selected
    if (newState.length == 0) {
      setShortlistSelect(false);
    }
  }

  function isProjectAlreadySelected(projectId: string): number {
    return selected.findIndex(
      (project) => project.projectRegistryId == projectId
    );
  }
}
