import { useBallot } from "../context/BallotContext";
import { Project } from "./api/types";
import { useRoundById } from "../context/RoundContext";
import { Link, useParams } from "react-router-dom";
import Navbar from "./common/Navbar";
import DefaultLogoImage from "../assets/default_logo.png";
import { ChevronLeftIcon } from "@heroicons/react/solid";
import { TrashIcon } from "@heroicons/react/outline";
import { Button } from "./common/styles";

export default function ViewBallot() {
  const { chainId, roundId } = useParams();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  useRoundById(chainId!, roundId!);

  const [shortlist, , , finalBallot] = useBallot();

  const shortlistNotEmpty = shortlist.length > 0;
  const finalBallotNotEmpty = finalBallot.length > 0;

  return (
    <>
      <Navbar roundUrlPath={`/round/${chainId}/${roundId}`} />

      <div className="mx-20 h-screen px-4 py-7">
        {Header(chainId, roundId)}

        <div className="grid grid-cols-2 gap-4">
          {shortlistNotEmpty && ProjectShortList(shortlist)}
          {!shortlistNotEmpty && EmptyProjectShortList(chainId, roundId)}

          {finalBallotNotEmpty && ProjectFinalBallot(finalBallot)}
          {!finalBallotNotEmpty && EmptyProjecFinalBallot()}
        </div>
        <div className="grid grid-cols-2  gap-4">
          <div></div>
          <div>
            {Summary()}

            <Button
              $variant="solid"
              type="button"
              className=" items-center shadow-sm text-sm rounded w-full opacity-50"
            >
              Submit your donation!
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

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
      Select your favorite projects from the Shortlist to build your Final Donation.
    </p>
  </div>
 );
}

function ProjectShortList(shortlist: Project[]) {
  const [, , removeProjectFromShortlist] = useBallot();

  return (
    <div className="block p-6 rounded-lg shadow-lg bg-white border">
      <h2 className="text-xl border-b-2 pb-2">Shortlist</h2>

      <div className="my-4">
        {shortlist.map((project: Project, key: number) => {
          return (
            <div
              key={key}
              data-testid="project"
              className="border-b-2 border-grey-100 mb-2 flex justify-between px-2 pt-2 pb-6"
            >
              <div className="flex">
                <img
                  className="h-[64px]"
                  src={
                    project.projectMetadata.logoImg
                      ? `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${project.projectMetadata.logoImg}`
                      : DefaultLogoImage
                  }
                />

                <div className="pl-4 mt-1">
                  <p className="font-semibold mb-2">
                    {project.projectMetadata.title}
                  </p>
                  <p className="text-sm">
                    {project.projectMetadata.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 mr-2">
                <TrashIcon
                  data-testid="remove-from-shortlist"
                  onClick={() => removeProjectFromShortlist(project)}
                  className="w-6 h-6"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyProjectShortList(chainId?: string, roundId?: string) {
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

function ProjectFinalBallot(finalBallot: Project[]) {
  return (
    <div>
      {finalBallot.map((project: Project, key: number) => {
        return (
          <div key={key} data-testid="project">
            {project.projectMetadata.title}
          </div>
        );
      })}
    </div>
  );
}

function EmptyProjecFinalBallot() {
  return (
    <>
      <div className="block p-6 rounded-lg shadow-lg bg-white border border-violet-400">
        <h2 className="text-xl border-b-2 pb-2">
          Final Donation
        </h2>

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
