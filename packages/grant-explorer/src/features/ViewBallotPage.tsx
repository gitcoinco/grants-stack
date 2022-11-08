import { useBallot } from "../context/BallotContext";
import { Project } from "./api/types";
import { useRoundById } from "../context/RoundContext";
import { useParams } from "react-router-dom";
import Navbar from "./common/Navbar";

export default function ViewBallot() {
  const { chainId, roundId } = useParams();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  useRoundById(chainId!, roundId!);

  const [shortlist, , ,finalBallot] = useBallot();
  const shortlistNotEmpty = shortlist.length > 0;
  const finalBallotNotEmpty = finalBallot.length > 0;


  return (
    <>
      <Navbar roundUrlPath={`/round/${chainId}/${roundId}`} />
      {/* Shortlist */}
      <div>
        {shortlistNotEmpty && ProjectShortList(shortlist)}
        {!shortlistNotEmpty && EmptyProjectShortList() }
      </div>

      {/* Final Ballot */}
      <div>
        {finalBallotNotEmpty && ProjectFinalBallot(finalBallot)}
        {!finalBallotNotEmpty && EmptyProjecFinalBallot() }
      </div>
    </>
  );
}

function ProjectShortList(shortlist: Project[]) {
  return (
    <div>
      {shortlist.map((project: Project, key: number) => {
        return (
          <div key={key} data-testid="project">
            {project.projectMetadata.title}
          </div>
        );
      })}
    </div>
  );
}


function EmptyProjectShortList() {
  return (
    <>
      <p>You do not have anything on your shortlist</p>
    </>
  )
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
      <p>You do not have anything on your ballot</p>
    </>
  )
}