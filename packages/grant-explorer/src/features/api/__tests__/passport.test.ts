import {
  fetchPassport,
} from "../passport";
import { faker } from "@faker-js/faker";
import { BigNumber, ethers } from "ethers";

jest.mock("../passport", () => {
  return {
    ...jest.requireActual("../passport"),
    fetchPassport: jest.fn(),
  };
});

const userAddress = faker.finance.ethereumAddress();

const mockAccount = {
  address: userAddress,
  isConnected: true,
};

const mockBalance = {
  data: {
    value: BigNumber.from(ethers.utils.parseUnits("10", 18)),
  },
};

const mockSigner = {
  data: {},
};

const mockNetwork = {
  chain: {
    id: 5,
    name: "Goerli",
  },
  chains: [
    {
      id: 10,
      name: "Optimism",
    },
    {
      id: 5,
      name: "Goerli",
    },
  ],
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
    const resp = await fetchPassport(userAddress, "12");
    expect(resp).toBeDefined();
    expect(resp.ok).toBeTruthy();
    expect(resp.status).toEqual(200);
  });
});
