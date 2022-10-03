import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { ReduxRouter } from "@lagunovsky/redux-react-router";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import history from "../history";
import setupStore from "../store";
import { Metadata, Round } from "../types";
import { Alert } from "../types/alert";

export const buildAlert = (attrs = {}): Alert => ({
  id: 1,
  type: "success",
  message: "Hello World",
  ...attrs,
});

export const buildRound = (round: any): Round => ({
  address: "0x8888",
  applicationsStartTime: 1663751953,
  applicationsEndTime: 2,
  roundStartTime: 3,
  roundEndTime: 4,
  token: "test-token",
  roundMetaPtr: {},
  roundMetadata: {},
  applicationMetaPtr: {},
  applicationMetadata: {},
  programName: "test-program",
  ...round,
});

export const buildVerifiableCredential = (
  type: string
): VerifiableCredential => ({
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  type: ["VerifiableCredential"],
  credentialSubject: {
    id: "did:pkh:eip155:1:subject",
    provider: `ClearText${type}#twitter-username-1`,
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
    github: buildVerifiableCredential("Github"),
    twitter: buildVerifiableCredential("Twitter"),
  },
  ...metadata,
});

export const renderWrapped = (ui: React.ReactElement, store = setupStore()) => {
  const wrapped = (
    <Provider store={store}>
      <ReduxRouter store={store} history={history}>
        {ui}
      </ReduxRouter>
    </Provider>
  );

  return { store, ...render(wrapped) };
};

export default {};
