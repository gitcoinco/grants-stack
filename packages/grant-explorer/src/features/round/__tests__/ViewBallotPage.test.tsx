import ViewBallot from "../../ViewBallotPage";
import { render, screen } from "@testing-library/react";
import { BallotContext } from "../../../context/BallotContext";
import { Project } from "../../api/types";
import { makeApprovedProjectData } from "../../../test-utils";
import { RoundProvider } from "../../../context/RoundContext";
import { faker } from "@faker-js/faker";
import { MemoryRouter } from "react-router-dom";

const chainId = faker.datatype.number();
const roundId = faker.finance.ethereumAddress();
const useParamsFn = () => ({
  chainId,
  roundId,
});


jest.mock("../../common/Navbar");
jest.mock("../../common/Auth");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: useParamsFn,
}));

describe("View Ballot Page", () => {

  describe("Shortlist", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("shows list of projects with project name", () => {
      const shortlist: Project[] = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];

      render(
        <MemoryRouter>
          <RoundProvider>
            <BallotContext.Provider
              value={{
                shortlist: shortlist, setShortlist: () => {},
                finalBallot: [], setFinalBallot: () => {}
              }}
            >
              <ViewBallot />
            </BallotContext.Provider>
          </RoundProvider>
        </MemoryRouter>
      );

      const projects = screen.getAllByTestId("project");
      expect(projects.length).toEqual(shortlist.length);
      projects.forEach((project, i) => {
        expect(project.textContent).toContain(shortlist[i].projectMetadata.title);
        expect(project.textContent).toContain(shortlist[i].projectMetadata.description);
      });
    });

    it("shows message that you have no projects", () => {
      render(
        <MemoryRouter>
          <RoundProvider>
            <BallotContext.Provider
              value={{
                shortlist: [], setShortlist: () => {},
                finalBallot: [], setFinalBallot: () => {}
              }}
            >
              <ViewBallot />
            </BallotContext.Provider>
          </RoundProvider>
        </MemoryRouter>
      );
      screen.getByText(/Projects that you add to the Shortlist will appear here./i);
    });
  });

  describe("Final Ballot", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("shows list of projects with project name", () => {
      const finalBallot: Project[] = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];

      render(
        <MemoryRouter>
          <RoundProvider>
            <BallotContext.Provider
              value={{
                shortlist: [], setShortlist: () => {},
                finalBallot: finalBallot, setFinalBallot: () => {}
              }}
            >
              <ViewBallot />
            </BallotContext.Provider>
          </RoundProvider>
        </MemoryRouter>
      );

      const projects = screen.getAllByTestId("project");
      expect(projects.length).toEqual(finalBallot.length);
      projects.forEach((project, i) => {
        expect(project.textContent).toContain(finalBallot[i].projectMetadata.title);
      });
    });

    it("shows message that you have no projects", () => {
      render(
        <MemoryRouter>
          <RoundProvider>
            <BallotContext.Provider
              value={{
                shortlist: [], setShortlist: () => {},
                finalBallot: [], setFinalBallot: () => {}
              }}
            >
              <ViewBallot />
            </BallotContext.Provider>
          </RoundProvider>
        </MemoryRouter>
      );
      screen.getByText(/Add the projects you want to fund here!/i);
    });
  });

  describe("Summary", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("shows default amount that you have no projects in final ballot", () => {
      render(
        <MemoryRouter>
          <RoundProvider>
            <BallotContext.Provider
              value={{
                shortlist: [], setShortlist: () => {},
                finalBallot: [], setFinalBallot: () => {}
              }}
            >
              <ViewBallot />
            </BallotContext.Provider>
          </RoundProvider>
        </MemoryRouter>
      );
      screen.getByText(/Your contribution/i);
      screen.getByText(/000.00 DAI/i);
    });
  });
});
