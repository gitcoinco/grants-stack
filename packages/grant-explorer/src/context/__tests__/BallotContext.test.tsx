import { fireEvent, render, screen } from "@testing-library/react";
import { BallotProvider, useBallot } from "../BallotContext";
import { Project } from "../../features/api/types";
import { makeApprovedProjectData } from "../../test-utils";
import { loadShortlist, saveShortlist } from "../../features/api/LocalStorage";
import { initialRoundState, RoundContext } from "../RoundContext";

jest.mock("../../features/api/LocalStorage");

describe("<BallotProvider>", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("when ballot is empty", () => {
    it("should not have any projects in the shortlist", () => {
      render(
        <BallotProvider>
          <TestingUseBallotComponent />
        </BallotProvider>
      );

      expect(screen.queryAllByTestId("project")).toHaveLength(0);
    });

    it("should add a project to the shortlist when add project is invoked", () => {
      render(
        <BallotProvider>
          <TestingUseBallotComponent />
        </BallotProvider>
      );
      fireEvent.click(screen.getByTestId("add-project"));

      expect(screen.getAllByTestId("project")).toHaveLength(1);
    });
  });

  it("should not add the same project twice to the shortlist", () => {
    render(
      <BallotProvider>
        <TestingUseBallotComponent />
      </BallotProvider>
    );
    fireEvent.click(screen.getByTestId("add-project"));
    fireEvent.click(screen.getByTestId("add-project"));

    expect(screen.getAllByTestId("project")).toHaveLength(1);
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

    expect(screen.getAllByTestId("project")).toHaveLength(shortlist.length);
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
    fireEvent.click(screen.getByTestId("add-project"));

    expect(saveShortlist).toBeCalled();
  });

  it("should update the shortlist when removing the project from the shortlist", () => {
    render(
      <BallotProvider>
        <TestingUseBallotComponent />
      </BallotProvider>
    );
    fireEvent.click(screen.getByTestId("add-project"));
    expect(screen.getAllByTestId("project")).toHaveLength(1);

    fireEvent.click(screen.getByTestId("remove-project"));
    expect(screen.queryAllByTestId("project")).toHaveLength(0);
  });

  it("does not error when trying to remove a project not in the shortlist", () => {
    render(
      <BallotProvider>
        <TestingUseBallotComponent />
      </BallotProvider>
    );

    fireEvent.click(screen.getByTestId("remove-project"));
    expect(screen.queryAllByTestId("project")).toHaveLength(0);
  });
});

const testProject: Project = makeApprovedProjectData();

const TestingUseBallotComponent = () => {
  const [
    shortlist,
    handleAddProjectToShortlist,
    handleRemoveProjectFromShortlist
  ] = useBallot();


  return (
    <>
      {shortlist.map((project, index) => {
        return (
          <div key={index} data-testid="project">
            {`Grant Application Id: ${project.grantApplicationId}
            || Project Registry Id: ${project.projectRegistryId}`}

            <span data-testid="project-id">{project.projectRegistryId}</span>
          </div>
        );
      })}

      <button
        data-testid="add-project"
        onClick={() => handleAddProjectToShortlist(testProject)}
      >
        Add Project
      </button>

      <button
        data-testid="remove-project"
        onClick={() => handleRemoveProjectFromShortlist(testProject)}
      >
        Remove Project
      </button>
    </>
  );
};
