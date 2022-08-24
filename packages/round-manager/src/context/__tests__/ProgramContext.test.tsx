import { ProgramProvider, usePrograms } from "../ProgramContext"
import { screen } from "@testing-library/react"
import { makeProgramData, renderWithContext } from "../../test-utils"
import { listPrograms } from "../../features/api/program"

jest.mock("../../features/api/program")
jest.mock("../../features/common/Auth", () => ({
  useWallet: () => ({ provider: {} })
}))
jest.mock("wagmi")
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}))

describe("<ListProgramProvider />", () => {
  it("provides programs based on current wallet address", async () => {
    (listPrograms as any).mockResolvedValue([makeProgramData(), makeProgramData()])

    renderWithProvider()

    expect(await screen.findAllByTestId("program")).toHaveLength(2)
  })

  it("propagates error state when failing to list programs", async () => {
    (listPrograms as any).mockRejectedValue(Error("some error message text"))

    renderWithProvider()

    await screen.findByTestId("error-msg")
    await screen.findByText("some error message text")
  })
})

const TestingComponent = () => {
  const { programs, listProgramsError } = usePrograms()

  return (
    <>
      <ul>
      {
        programs.map((it, index) => (
          <li data-testid="program" key={index}>
            <p>{it.metadata?.name}</p>
          </li>
        ))
      }
      </ul>

      { listProgramsError &&
        <p data-testid="error-msg">
          { listProgramsError?.message || "" }
        </p>
      }
    </>
  )
}

function renderWithProvider() {
  renderWithContext(
    <ProgramProvider>
      <TestingComponent></TestingComponent>
    </ProgramProvider>
  )
}
