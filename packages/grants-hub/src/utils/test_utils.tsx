import { ChakraProvider } from "@chakra-ui/react";
import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { ReduxRouter } from "@lagunovsky/redux-react-router";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { ethers } from "ethers";
import history from "../history";
import setupStore from "../store";
import { FormInputs, Metadata, Round } from "../types";
import { Alert } from "../types/alert";

export function addressFrom(n: number): string {
  const bn = ethers.BigNumber.from(n);
  return ethers.utils.hexZeroPad(bn.toHexString(), 20);
}

export const buildAlert = (attrs = {}): Alert => ({
  id: 1,
  type: "success",
  title: "Hello World",
  body: "this is test content",
  ...attrs,
});

export const buildRound = (round: any): Round => ({
  address: addressFrom(1),
  applicationsStartTime: 1663751953,
  applicationsEndTime: Date.now() / 1000 + 36000,
  roundStartTime: 1663751953,
  roundEndTime: Date.now() / 1000 + 36000,
  token: "0x0000000000000000000000000000000000000000",
  roundMetaPtr: {},
  roundMetadata: {},
  applicationMetaPtr: {},
  applicationMetadata: {},
  programName: "test-program",
  ...round,
});

export const buildVerifiableCredential = (
  type: string,
  handle: string
): VerifiableCredential => ({
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  type: ["VerifiableCredential"],
  credentialSubject: {
    id: "did:pkh:eip155:1:subject",
    provider: `ClearText${type}#${handle}`,
    hash: "v0.0.0:hash",
    "@context": [
      {
        hash: "https://schema.org/Text",
        provider: "https://schema.org/Text",
      },
    ],
  },
  issuer: "did:key:key-1",
  issuanceDate: "2022-09-16T12:10:59.019Z",
  proof: {
    type: "Ed25519Signature2018",
    proofPurpose: "assertionMethod",
    verificationMethod: "did:key:key-1#key-1",
    created: "2022-09-16T12:10:59.020Z",
    jws: "test-jws",
  },
  expirationDate: "2022-12-15T12:10:59.019Z",
});

export const buildProjectMetadata = (metadata: any): Metadata => ({
  protocol: 1,
  pointer: "0x7878",
  id: 2,
  title: "title 1",
  description: "description",
  website: "http://example.com",
  bannerImg: "banner-1",
  logoImg: "logo-1",
  userGithub: "user-github-1",
  projectGithub: "project-github-1",
  projectTwitter: "project-twitter-1",
  credentials: {
    github: buildVerifiableCredential("Github", "my-github"),
    twitter: buildVerifiableCredential("Twitter", "my-twitter"),
  },
  createdAt: 123,
  ...metadata,
});

export const buildFormMetadata = (metadata: any): FormInputs => ({
  title: "title 1",
  description: "description",
  website: "http://example.com",
  bannerImg: "banner-1",
  logoImg: "logo-1",
  userGithub: "user-github-1",
  projectGithub: "project-github-1",
  projectTwitter: "project-twitter-1",
  ...metadata,
});

export const buildProjectApplication = (application: any): any => ({
  chainId: 5,
  roundID: addressFrom(1),
  status: "APPROVED",
  ...application,
});

export const renderWrapped = (
  ui: React.ReactElement,
  store = setupStore()
): any => {
  const wrapped = (
    <ChakraProvider>
      <Provider store={store}>
        <ReduxRouter store={store} history={history}>
          {ui}
        </ReduxRouter>
      </Provider>
    </ChakraProvider>
  );

  return { store, ...render(wrapped) };
};

export default {};
