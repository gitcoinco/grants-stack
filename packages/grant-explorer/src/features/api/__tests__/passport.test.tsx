import { fetchPassport, submitPassport } from "../passport";
import { faker } from "@faker-js/faker";
import {
  mockBalance,
  mockNetwork,
  mockSigner,
} from "../../../test-utils";
import { Mock } from "vitest";

vi.mock("../passport", () => {
  return {
    ...vi.importActual("../passport"),
    fetchPassport: vi.fn(),
    submitPassport: vi.fn(),
  };
});

const userAddress = faker.finance.ethereumAddress();
const communityId = faker.random.numeric();
const apiKey = faker.random.alphaNumeric();

const mockAccount = {
  address: userAddress,
  isConnected: true,
};

vi.mock("wagmi", () => ({
  useAccount: () => mockAccount,
  useBalance: () => mockBalance,
  useSigner: () => mockSigner,
  useNetwork: () => mockNetwork,
}));

describe("fetchPassport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* TODO: this doesn't test anything */
  it("should return a response", async () => {
    (fetchPassport as Mock).mockResolvedValue({
      ok: true,
      status: 200,
    });
    const resp = await fetchPassport(userAddress, communityId, apiKey);
    expect(resp).toBeDefined();
    expect(resp.ok).toBeTruthy();
    expect(resp.status).toEqual(200);
  });
});

describe("submitPassport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* TODO: again, this doesn't test anything */
  it("should return a response", async () => {
    (submitPassport as Mock).mockResolvedValue({
      ok: true,
      status: 200,
    });
    const resp = await submitPassport(userAddress, communityId, apiKey);
    expect(resp).toBeDefined();
    expect(resp.ok).toBeTruthy();
    expect(resp.status).toEqual(200);
  });
});
