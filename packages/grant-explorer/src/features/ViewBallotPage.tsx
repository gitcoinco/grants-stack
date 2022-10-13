import { useBallot } from "../context/BallotContext";
import { Project } from "./api/types";

export default function ViewBallot() {
  const [shortlist] = useBallot();
  const shortlistNotEmpty = shortlist.length > 0;

  return (
    <div>
      {shortlistNotEmpty && ProjectShortList(shortlist)}
      {!shortlistNotEmpty && <p>You do not have anything on your ballot</p>}
    </div>
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
