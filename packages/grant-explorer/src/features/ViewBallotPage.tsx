import { useBallot } from "../context/BallotContext";
import { Project } from "./api/types";
import { useRoundById } from "../context/RoundContext";
import { Link, useParams } from "react-router-dom";
import Navbar from "./common/Navbar";
import { ChevronLeftIcon } from "@heroicons/react/solid";
import { Button } from "./common/styles";

export default function ViewBallot() {
  const { chainId, roundId } = useParams();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  useRoundById(chainId!, roundId!);

  const [shortlist, , ,finalBallot] = useBallot();


  return (
    <>
      <Navbar roundUrlPath={`/round/${chainId}/${roundId}`} />

      <div className="mx-20 h-screen px-4 py-7">

        { Header(chainId, roundId) }

        <div className="grid grid-cols-2 gap-4">
          { ProjectShortList(shortlist, chainId, roundId) }

          { ProjectFinalBallot(finalBallot) }
        </div>
        <div className="grid grid-cols-2  gap-4">
          <div></div>
          <div>
            { Summary() }

            <Button
              $variant="solid"
              type="button"
              className=" items-center shadow-sm text-sm rounded w-full opacity-50"
            >
              Cast your ballot!
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function Header(chainId?: string, roundId?: string) {
 return(
  <div>
    <div className="flex flex-row items-center gap-3 text-sm">
      <ChevronLeftIcon className="h-5 w-5 mt-6 mb-6" />
      <Link to={`/round/${chainId}/${roundId}`}>
        <span className="font-normal">Back</span>
      </Link>
    </div>

    <h1 className="text-3xl mt-6 font-thin border-b-2 pb-2">
      Ballot Builder
    </h1>

    <p className="my-4">
      Select your favorite projects from the Shortlist to build your Final Ballot.
    </p>
  </div>
 );
}

function ProjectShortList(shortlist: Project[], chainId?: string, roundId?: string) {
  const shortlistNotEmpty = shortlist.length > 0;
  return (
    <>
      { shortlistNotEmpty ?
        <div>
          {shortlist.map((project: Project, key: number) => {
            return (
              <div key={key} data-testid="project">
                {project.projectMetadata.title}
              </div>
            );
          })}
        </div>
        :
        EmptyProjectShortList(chainId, roundId)
      }
    </>
  );
}


function EmptyProjectShortList(chainId?: string, roundId?: string) {
  return (
    <>
      <div className="block p-6 rounded-lg shadow-lg bg-white border">
        <h2 className="text-xl border-b-2 pb-2">
          Shortlist
        </h2>

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
  )
}

function ProjectFinalBallot(finalBallot: Project[]) {
  const finalBallotNotEmpty = finalBallot.length > 0;

  return (
    <>
      { finalBallotNotEmpty ?
        <div>
          {finalBallot.map((project: Project, key: number) => {
            return (
              <div key={key} data-testid="project">
                {project.projectMetadata.title}
              </div>
            );
          })}
        </div>
      :
        EmptyProjecFinalBallot()
      }
    </>
  );
}

function EmptyProjecFinalBallot() {
  return (
    <>
      <div className="block p-6 rounded-lg shadow-lg bg-white border border-violet-400">
        <h2 className="text-xl border-b-2 pb-2">
          Final Ballot
        </h2>

        <div className="mt-4">
          <p className="text-grey-500">
            Add the projects you want to fund here!
          </p>
        </div>
      </div>
    </>
  )
}

function Summary() {
  return (
    <>
      <div className="my-5 block p-6 rounded-lg shadow-lg bg-white border border-violet-400 font-semibold">
        <h2 className="text-xl border-b-2 pb-2">
          Summary
        </h2>

        <div className="flex justify-between mt-4">
          <p>Your Contribution</p>
          <p>000.00 DAI</p>
        </div>
      </div>
    </>
  )
}