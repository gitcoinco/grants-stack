import { fetchPassport, submitPassport } from "../passport";
import { faker } from "@faker-js/faker";
import { BigNumber, ethers } from "ethers";
import { mockBalance, mockNetwork, mockSigner } from "../../../test-utils";

jest.mock("../passport", () => {
  return {
    ...jest.requireActual("../passport"),
    fetchPassport: jest.fn(),
    submitPassport: jest.fn(),
  };
});

const userAddress = faker.finance.ethereumAddress();
const communityId = faker.random.numeric();

const mockAccount = {
  address: userAddress,
  isConnected: true,
};

jest.mock("wagmi", () => ({
  useAccount: () => mockAccount,
  useBalance: () => mockBalance,
  useSigner: () => mockSigner,
  useNetwork: () => mockNetwork,
}));

describe("fetchPassport", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a response", async () => {
    (fetchPassport as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
    });
    const resp = await fetchPassport(userAddress, communityId);
    console.log(resp);
    expect(resp).toBeDefined();
    expect(resp.ok).toBeTruthy();
    expect(resp.status).toEqual(200);
  });
});

describe("submitPassport", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a response", async () => {
    (submitPassport as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
    });
    const resp = await submitPassport(userAddress, communityId);
    expect(resp).toBeDefined();
    expect(resp.ok).toBeTruthy();
    expect(resp.status).toEqual(200);
  });
});
