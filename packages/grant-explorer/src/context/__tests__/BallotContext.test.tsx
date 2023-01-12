import { fireEvent, render, screen } from "@testing-library/react";
import { BallotProvider, useBallot } from "../BallotContext";
import { Project } from "../../features/api/types";
import { makeApprovedProjectData } from "../../test-utils";
import {
  loadFinalBallot,
  loadShortlist,
  saveFinalBallot,
  saveShortlist,
} from "../../features/api/LocalStorage";
import { initialRoundState, RoundContext } from "../RoundContext";

jest.mock("../../features/api/LocalStorage");

describe("<BallotProvider>", () => {
  describe("when ballot is empty", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should not have any projects in the shortlist and final ballot", () => {
      render(
        <BallotProvider>
          <TestingUseBallotComponent />
        </BallotProvider>
      );

      expect(screen.queryAllByTestId("shortlist-project")).toHaveLength(0);
      expect(screen.queryAllByTestId("finalBallot-project")).toHaveLength(0);
    });
  });

  describe("Shortlist", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should add a project to the shortlist when add project is invoked", () => {
      render(
        <BallotProvider>
          <TestingUseBallotComponent />
        </BallotProvider>
      );
      fireEvent.click(screen.getByTestId("add-project-to-shortlist"));

      expect(screen.getAllByTestId("shortlist-project")).toHaveLength(1);
    });

    it("should not add the same project twice to the shortlist", () => {
      render(
        <BallotProvider>
          <TestingUseBallotComponent />
        </BallotProvider>
      );
      fireEvent.click(screen.getByTestId("add-project-to-shortlist"));
      fireEvent.click(screen.getByTestId("add-project-to-shortlist"));

      expect(screen.getAllByTestId("shortlist-project")).toHaveLength(1);
    });

    it("recovers shortlist when shortlist has been saved", () => {
      const shortlist: Project[] = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];
      (loadShortlist as jest.Mock).mockReturnValue(shortlist);

      render(
        <RoundContext.Provider
          value={{
            state: { ...initialRoundState, currentRoundId: "1" },
            dispatch: jest.fn(),
          }}
        >
          <BallotProvider>
            <TestingUseBallotComponent />
          </BallotProvider>
        </RoundContext.Provider>
      );

      expect(screen.getAllByTestId("shortlist-project")).toHaveLength(
        shortlist.length
      );
      expect(
        screen.getByText(shortlist[0].projectRegistryId)
      ).toBeInTheDocument();
      expect(
        screen.getByText(shortlist[1].projectRegistryId)
      ).toBeInTheDocument();
    });

    it("should save the shortlist when currently in a round and the shortlist changes", () => {
      render(
        <RoundContext.Provider
          value={{
            state: { ...initialRoundState, currentRoundId: "1" },
            dispatch: jest.fn(),
          }}
        >
          <BallotProvider>
            <TestingUseBallotComponent />
          </BallotProvider>
        </RoundContext.Provider>
      );
      fireEvent.click(screen.getByTestId("add-project-to-shortlist"));

      expect(saveShortlist).toBeCalled();
    });

    it("should update the shortlist when removing the project from the shortlist", () => {
      render(
        <BallotProvider>
          <TestingUseBallotComponent />
        </BallotProvider>
      );
      fireEvent.click(screen.getByTestId("add-project-to-shortlist"));
      expect(screen.getAllByTestId("shortlist-project")).toHaveLength(1);

      fireEvent.click(screen.getByTestId("remove-project-from-shortlist"));
      expect(screen.queryAllByTestId("shortlist-project")).toHaveLength(0);
    });

    it("does not error when trying to remove a project not in the shortlist", () => {
      render(
        <BallotProvider>
          <TestingUseBallotComponent />
        </BallotProvider>
      );

      fireEvent.click(screen.getByTestId("remove-project-from-shortlist"));
      expect(screen.queryAllByTestId("shortlist-project")).toHaveLength(0);
    });
  });

  describe("FinalBallot", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should add a project to the shortlist when add project is invoked", () => {
      render(
        <BallotProvider>
          <TestingUseBallotComponent />
        </BallotProvider>
      );
      fireEvent.click(screen.getByTestId("add-project-to-finalBallot"));

      expect(screen.getAllByTestId("finalBallot-project")).toHaveLength(1);
    });

    it("should not add the same project twice to the finalBallot", () => {
      render(
        <BallotProvider>
          <TestingUseBallotComponent />
        </BallotProvider>
      );
      fireEvent.click(screen.getByTestId("add-project-to-finalBallot"));
      fireEvent.click(screen.getByTestId("add-project-to-finalBallot"));

      expect(screen.queryAllByTestId("finalBallot-project")).toHaveLength(1);
    });

    it("adding project to finalBallot removes it from shortlist ", () => {
      render(
        <BallotProvider>
          <TestingUseBallotComponent />
        </BallotProvider>
      );

      expect(screen.queryAllByTestId("shortlist-project")).toHaveLength(0);
      expect(screen.queryAllByTestId("finalBallot-project")).toHaveLength(0);

      fireEvent.click(screen.getByTestId("add-project-to-shortlist"));
      expect(screen.getAllByTestId("shortlist-project")).toHaveLength(1);
      expect(screen.queryAllByTestId("finalBallot-project")).toHaveLength(0);

      fireEvent.click(screen.getByTestId("add-project-to-finalBallot"));
      expect(screen.queryAllByTestId("shortlist-project")).toHaveLength(0);
      expect(screen.getAllByTestId("finalBallot-project")).toHaveLength(1);
    });

    it("removing project from finalBallot adds it to the shortlist", () => {
      render(
        <BallotProvider>
          <TestingUseBallotComponent />
        </BallotProvider>
      );

      fireEvent.click(screen.getByTestId("add-project-to-finalBallot"));
      expect(screen.queryAllByTestId("shortlist-project")).toHaveLength(0);
      expect(screen.getAllByTestId("finalBallot-project")).toHaveLength(1);

      fireEvent.click(screen.getByTestId("remove-project-from-finalBallot"));
      expect(screen.queryAllByTestId("finalBallot-project")).toHaveLength(0);
      expect(screen.queryAllByTestId("shortlist-project")).toHaveLength(1);
    });

    it("recovers finalBallot when finalBallot has been saved", () => {
      const finalBallot: Project[] = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];
      (loadFinalBallot as jest.Mock).mockReturnValue(finalBallot);

      render(
        <RoundContext.Provider
          value={{
            state: { ...initialRoundState, currentRoundId: "1" },
            dispatch: jest.fn(),
          }}
        >
          <BallotProvider>
            <TestingUseBallotComponent />
          </BallotProvider>
        </RoundContext.Provider>
      );

      expect(screen.getAllByTestId("finalBallot-project")).toHaveLength(
        finalBallot.length
      );
      expect(
        screen.getByText(finalBallot[0].projectRegistryId)
      ).toBeInTheDocument();
      expect(
        screen.getByText(finalBallot[1].projectRegistryId)
      ).toBeInTheDocument();
    });

    it("should save the finalBallot when currently in a round and the finalBallot changes", () => {
      render(
        <RoundContext.Provider
          value={{
            state: { ...initialRoundState, currentRoundId: "1" },
            dispatch: jest.fn(),
          }}
        >
          <BallotProvider>
            <TestingUseBallotComponent />
          </BallotProvider>
        </RoundContext.Provider>
      );
      fireEvent.click(screen.getByTestId("add-project-to-finalBallot"));

      expect(saveFinalBallot).toBeCalled();
    });

    it("does not error when trying to remove a project not in the finalBallot", () => {
      render(
        <BallotProvider>
          <TestingUseBallotComponent />
        </BallotProvider>
      );

      fireEvent.click(screen.getByTestId("remove-project-from-finalBallot"));
      expect(screen.queryAllByTestId("finalBallot-project")).toHaveLength(0);
    });
  });
});

const testProject: Project = makeApprovedProjectData();

const TestingUseBallotComponent = () => {
  const [
    shortlist,
    finalBallot,
    handleAddProjectsToShortlist,
    handleRemoveProjectsFromShortlist,
    handleAddProjectsToFinalBallot,
    ,
    handleRemoveProjectsFromFinalBallotAndAddToShortlist,
  ] = useBallot();

  return (
    <>
      {shortlist.map((project, index) => {
        return (
          <div key={index} data-testid="shortlist-project">
            {`Grant Application Id: ${project.grantApplicationId}
            || Project Registry Id: ${project.projectRegistryId}`}

            <span data-testid="shortlist-project-id">
              {project.projectRegistryId}
            </span>
          </div>
        );
      })}

      {finalBallot.map((project, index) => {
        return (
          <div key={index} data-testid="finalBallot-project">
            {`Grant Application Id: ${project.grantApplicationId}
            || Project Registry Id: ${project.projectRegistryId}`}

            <span data-testid="finalBallot-project-id">
              {project.projectRegistryId}
            </span>
          </div>
        );
      })}

      <button
        data-testid="add-project-to-shortlist"
        onClick={() => handleAddProjectsToShortlist([testProject])}
      >
        Add Project To Shortlist
      </button>

      <button
        data-testid="remove-project-from-shortlist"
        onClick={() => handleRemoveProjectsFromShortlist([testProject])}
      >
        Remove Project From Shortlist
      </button>

      <button
        data-testid="add-project-to-finalBallot"
        onClick={() => handleAddProjectsToFinalBallot([testProject])}
      >
        Add Project To Final Ballot
      </button>

      <button
        data-testid="remove-project-from-finalBallot"
        onClick={() =>
          handleRemoveProjectsFromFinalBallotAndAddToShortlist([testProject])
        }
      >
        Remove Project From Final Ballot
      </button>
    </>
  );
};
