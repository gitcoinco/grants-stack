import { faker } from "@faker-js/faker";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { initialRoundState, RoundContext, RoundState } from "./context/RoundContext";
import { Round } from "./features/api/types";

export const makeRoundData = (overrides: Partial<Round> = {}): Round => {
  const applicationsStartTime = faker.date.soon();
  const applicationsEndTime = faker.date.soon(10, applicationsStartTime);
  const roundStartTime = faker.date.future(1, applicationsEndTime);
  const roundEndTime = faker.date.soon(21, roundStartTime);
  return {
    id: faker.finance.ethereumAddress(),
    roundMetadata: {
      name: faker.company.name(),
    },
    applicationsStartTime,
    applicationsEndTime,
    roundStartTime,
    roundEndTime,
    token: faker.finance.ethereumAddress(),
    votingStrategy: faker.finance.ethereumAddress(),
    ownedBy: faker.finance.ethereumAddress(),
    ...overrides,
  };
};

export const renderWithContext = (
  ui: JSX.Element,
  programStateOverrides: Partial<RoundState> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: any = jest.fn()
) =>
  render(
    <MemoryRouter>
      <RoundContext.Provider
        value={{
          state: { ...initialRoundState, ...programStateOverrides },
          dispatch,
        }}
      >
        {ui}
      </RoundContext.Provider>
    </MemoryRouter>
  );
