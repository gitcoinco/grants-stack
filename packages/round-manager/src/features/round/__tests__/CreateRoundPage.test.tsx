import CreateRoundPage from "../CreateRoundPage";
import { makeProgramData, renderWithProgramContext } from "../../../test-utils";
import { faker } from "@faker-js/faker";
import { RoundDetailForm } from "../RoundDetailForm";
import ApplicationEligibilityForm from "../ApplicationEligibilityForm";
import { RoundApplicationForm } from "../RoundApplicationForm";
import * as FormWizardImport from "../../common/FormWizard";
import { fireEvent, screen } from "@testing-library/react";
import QuadraticFundingForm from "../QuadraticFundingForm";
import { useAccount } from "wagmi";
import { useSearchParams } from "react-router-dom";

jest.mock("../../common/Navbar");
const formWizardSpy = jest.spyOn(FormWizardImport, "FormWizard");

jest.mock("wagmi", () => ({
  ...jest.requireActual("wagmi"),
  useAccount: jest.fn(),
}));

const programId = faker.finance.ethereumAddress();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useSearchParams: jest.fn(),
}));

describe("<CreateRoundPage />", () => {
  beforeEach(() => {
    (useAccount as jest.Mock).mockReturnValue({
      address: "0x0",
    });

    (useSearchParams as jest.Mock).mockReturnValue([
      {
        get: () => programId,
      },
    ]);
  });

  it("sends program to form wizard", () => {
    const programs = [makeProgramData({ id: programId })];

    renderWithProgramContext(<CreateRoundPage />, { programs });

    const firstFormWizardCall = formWizardSpy.mock.calls[0];
    const firstCallArgument = firstFormWizardCall[0];
    expect(firstCallArgument).toMatchObject({
      steps: [
        RoundDetailForm,
        QuadraticFundingForm,
        ApplicationEligibilityForm,
        RoundApplicationForm,
      ],
      initialData: { program: programs[0] },
    });
  });

  it("exit button redirects to home", async () => {
    const programs = [makeProgramData({ id: programId })];

    renderWithProgramContext(<CreateRoundPage />, { programs });

    const exitButton = await screen.findByText("Exit");
    expect(exitButton).toBeTruthy();
    fireEvent.click(exitButton);
    expect(window.location.pathname).toBe("/");
  });

  it("sends program matching search query to form wizard", () => {
    jest.clearAllMocks();
    const programToChoose = makeProgramData({ id: programId });
    const programs = [makeProgramData(), programToChoose, makeProgramData()];

    renderWithProgramContext(<CreateRoundPage />, { programs });

    const firstFormWizardCall = formWizardSpy.mock.calls[0];
    const firstCallArgument = firstFormWizardCall[0];
    expect(firstCallArgument).toMatchObject({
      steps: [
        RoundDetailForm,
        QuadraticFundingForm,
        ApplicationEligibilityForm,
        RoundApplicationForm,
      ],
      initialData: { program: programToChoose },
    });
  });
});
