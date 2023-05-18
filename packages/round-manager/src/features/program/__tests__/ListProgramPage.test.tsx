import ListProgramPage from "../ListProgramPage";
import { screen } from "@testing-library/react";
import { makeProgramData, renderWithProgramContext } from "../../../test-utils";
import { ProgressStatus } from "../../api/types";

describe("<ListProgramPage />", () => {
  it("does not render a list of programs when no programs have been created", () => {
    renderWithProgramContext(<ListProgramPage />, {
      programs: [],
      fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
    });

    expect(screen.queryAllByTestId("program-card")).toHaveLength(0);
  });

  it("renders a list of programs when programs have been created", async () => {
    renderWithProgramContext(<ListProgramPage />, {
      programs: [makeProgramData(), makeProgramData()],
      fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
    });

    expect(await screen.findAllByTestId("program-card")).toHaveLength(2);
  });

  it("shows loading while fetching list of programs", async () => {
    renderWithProgramContext(<ListProgramPage />, {
      fetchProgramsStatus: ProgressStatus.IN_PROGRESS,
      programs: [],
    });

    screen.getByTestId("loading-spinner");
  });
});
