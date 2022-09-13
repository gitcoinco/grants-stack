import CreateRoundPage from "../CreateRoundPage";
import { makeProgramData, renderWithContext } from "../../../test-utils";
import { faker } from "@faker-js/faker";
import { RoundDetailForm } from "../RoundDetailForm";
import { RoundApplicationForm } from "../RoundApplicationForm";
import { useWallet } from "../../common/Auth";
import * as FormWizardImport from "../../common/FormWizard";

jest.mock("../../common/Navbar");
jest.mock("../../common/Auth");
const formWizardSpy = jest.spyOn(FormWizardImport, "FormWizard");

const programId = faker.finance.ethereumAddress();
const useParamsFn = () => [
  {
    get: () => programId,
  },
];
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useSearchParams: useParamsFn,
}));

describe("<CreateRoundPage />", () => {
  beforeEach(() => {
    (useWallet as jest.Mock).mockReturnValue({ chain: {}, address: "0x0", provider: { getNetwork: () => ({ chainId: "0x0"}) }});
  });

  it("sends program to form wizard", () => {
    const programs = [makeProgramData({ id: programId })];

    renderWithContext(<CreateRoundPage />, { programs });

    const firstFormWizardCall = formWizardSpy.mock.calls[0];
    const firstCallArgument = firstFormWizardCall[0];
    expect(firstCallArgument).toMatchObject({
      steps: [RoundDetailForm, RoundApplicationForm],
      initialData: { program: programs[0] },
    });
  });

  it("sends program matching search query to form wizard", () => {
    const programToChoose = makeProgramData({ id: programId });
    const programs = [makeProgramData(), programToChoose, makeProgramData()];

    renderWithContext(<CreateRoundPage />, { programs });

    const firstFormWizardCall = formWizardSpy.mock.calls[0];
    const firstCallArgument = firstFormWizardCall[0];
    expect(firstCallArgument).toMatchObject({
      steps: [RoundDetailForm, RoundApplicationForm],
      initialData: { program: programToChoose },
    });
  });
});
