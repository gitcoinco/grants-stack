// ---- Mocked values and helpers
import axios from "axios";
import {
  MOCK_CHALLENGE_CREDENTIAL,
  MOCK_VERIFY_RESPONSE_BODY,
} from "../__mocks__/axios";

// ---- Types
import {
  fetchVerifiableCredential,
  GHOrgRequestPayload,
  fetchChallengeCredential,
} from "../credentials";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Fetch Credentials", () => {
  const IAM_URL = "iam.example";
  const payload: GHOrgRequestPayload = {
    address: "0x0",
    type: "Simple",
    version: "Test-Case-1",
    org: "gitcoinco",
  };

  const MOCK_SIGNATURE = "Signed Message";
  let MOCK_SIGNER: {
    signMessage: jest.Mock<any, any>;
  };

  const IAM_CHALLENGE_ENDPOINT = `${IAM_URL}/v${payload.version}/challenge`;
  const expectedChallengeRequestBody = {
    payload: { address: payload.address, type: payload.type },
  };

  beforeEach(() => {
    MOCK_SIGNER = {
      signMessage: jest
        .fn()
        .mockImplementation(() => Promise.resolve(MOCK_SIGNATURE)),
    };
  });

  it("can fetch a challenge credential", async () => {
    mockedAxios.post.mockImplementationOnce(async () => ({
      data: { credential: MOCK_CHALLENGE_CREDENTIAL },
    }));
    const { challenge: actualChallenge } = await fetchChallengeCredential(
      IAM_URL,
      payload
    );

    // check that called the axios.post fn
    expect(axios.post).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(
      IAM_CHALLENGE_ENDPOINT,
      expectedChallengeRequestBody
    );
    expect(actualChallenge).toEqual(MOCK_CHALLENGE_CREDENTIAL);
  });

  it("can fetch a verifiable credential", async () => {
    mockedAxios.post.mockImplementation(async (url) => {
      if (url.includes("challenge")) {
        return {
          data: { credential: MOCK_CHALLENGE_CREDENTIAL },
        };
      }

      if (url.includes("verify")) {
        return {
          data: MOCK_VERIFY_RESPONSE_BODY,
        };
      }

      return {
        status: 404,
      };
    });

    const { credential, record, signature, challenge } =
      await fetchVerifiableCredential(IAM_URL, payload, MOCK_SIGNER);

    // called to fetch the challenge and to verify
    expect(axios.post).toHaveBeenCalledTimes(2);
    expect(axios.post).toHaveBeenNthCalledWith(
      1,
      IAM_CHALLENGE_ENDPOINT,
      expectedChallengeRequestBody
    );

    expect(MOCK_SIGNER.signMessage).toHaveBeenCalled();

    // we expect to get back the mocked response
    expect(signature).toEqual(MOCK_SIGNATURE);
    expect(challenge).toEqual(MOCK_CHALLENGE_CREDENTIAL);
    expect(credential).toEqual(MOCK_VERIFY_RESPONSE_BODY.credential);
    expect(record).toEqual(MOCK_VERIFY_RESPONSE_BODY.record);
  });

  it("will not attempt to sign if not provided a challenge in the challenge credential", async () => {
    jest.spyOn(axios, "post").mockResolvedValueOnce({
      data: {
        credential: {
          credentialSubject: {
            challenge: null,
          },
        },
      },
    });

    await expect(
      fetchVerifiableCredential(IAM_URL, payload, MOCK_SIGNER)
    ).rejects.toThrow("Unable to sign message");

    expect(axios.post).toHaveBeenNthCalledWith(
      1,
      IAM_CHALLENGE_ENDPOINT,
      expectedChallengeRequestBody
    );
    // NOTE: the signMessage function was never called
    expect(MOCK_SIGNER.signMessage).not.toBeCalled();
  });
});
