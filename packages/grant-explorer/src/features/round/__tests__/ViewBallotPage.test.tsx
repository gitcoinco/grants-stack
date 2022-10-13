import ViewBallot from "../../ViewBallotPage";
import { render, screen } from "@testing-library/react";
import { BallotContext } from "../../../context/BallotContext";
import { Project } from "../../api/types";
import { makeApprovedProjectData } from "../../../test-utils";
import { RoundProvider } from "../../../context/RoundContext";

describe("View Ballot Page", () => {
  it("shows list of projects with project name", () => {
    const shortlist: Project[] = [
      makeApprovedProjectData(),
      makeApprovedProjectData(),
    ];

    render(
      <RoundProvider>
        <BallotContext.Provider
          value={{ shortlist: shortlist, setShortlist: () => {} }}
        >
          <ViewBallot />
        </BallotContext.Provider>
      </RoundProvider>
    );

    const projects = screen.getAllByTestId("project");
    expect(projects.length).toEqual(shortlist.length);
    projects.forEach((project, i) => {
      expect(project.textContent).toContain(shortlist[i].projectMetadata.title);
    });
  });

  it("shows message that you have no projects", () => {
    render(
      <RoundProvider>
        <BallotContext.Provider
          value={{ shortlist: [], setShortlist: () => {} }}
        >
          <ViewBallot />
        </BallotContext.Provider>
      </RoundProvider>
    );
    screen.getByText(/you do not have anything on your ballot/i);
  });
});
