import { ChakraProvider } from "@chakra-ui/react";
import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { ReduxRouter } from "@lagunovsky/redux-react-router";
import { render } from "@testing-library/react";
import {
  AlloProvider,
  AlloV2,
  RoundVisibilityType,
  createMockTransactionSender,
} from "common";
import {
  DataLayer,
  DataLayerProvider,
  ProjectApplicationWithRound,
} from "data-layer";
import { ethers } from "ethers";
import { Provider } from "react-redux";
import { getConfig } from "common/src/config";
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

export const now = new Date().getTime() / 1000;

export const roundIdFrom = (n: number): string =>
  getConfig().allo.version === "allo-v1" ? addressFrom(n) : n.toString();

export const buildRound = (round: any): Round => ({
  id: roundIdFrom(1),
  address: addressFrom(1),
  applicationsStartTime: now,
  applicationsEndTime: now + 3600,
  roundStartTime: now + 3600,
  roundEndTime: now + 7200,
  token: "0x0000000000000000000000000000000000000000",
  roundMetaPtr: {},
  roundMetadata: {},
  applicationMetaPtr: {},
  applicationMetadata: {},
  programName: "test-program",
  payoutStrategy: "0x",
  strategyName: "allov1.QF",
  tags: ["allo-v1"],
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
  updatedAt: 123,
  chainId: 5,
  linkedChains: [1],
  nonce: BigInt(1),
  registryAddress: "0x1",
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

export const buildProjectApplication = (
  application: any
): ProjectApplicationWithRound => ({
  chainId: 5,
  roundId: addressFrom(1),
  status: "APPROVED",
  id: "1",
  metadataCid: "0x1",
  metadata: {},
  round: {
    applicationsStartTime: "0",
    applicationsEndTime: "0",
    donationsStartTime: "0",
    donationsEndTime: "0",
    roundMetadata: {
      name: "Round 1",
      roundType: "public" as RoundVisibilityType,
      eligibility: {
        description: "Eligibility description",
        requirements: [{ requirement: "Requirement 1" }],
      },
      programContractAddress: "0x1",
      support: {
        info: "https://support.com",
        type: "WEBSITE",
      },
    },
    name: "Round 1",
  },
  ...application,
});

const alloBackend = new AlloV2({
  chainId: 10,
  ipfsUploader: async () =>
    Promise.resolve({
      type: "success",
      value: "ipfsHash",
    }),
  waitUntilIndexerSynced: async () => Promise.resolve(BigInt(1)),
  transactionSender: createMockTransactionSender(),
});

// todo: introduce mock data layer?
const dataLayerConfig = new DataLayer({
  search: {
    baseUrl: "http://localhost/",
    pagination: {
      pageSize: 50,
    },
  },
  subgraph: {
    endpointsByChainId: "http://localhost/",
  },
  indexer: {
    baseUrl: "http://localhost/",
  },
});

export const renderWrapped = (
  ui: React.ReactElement,
  store = setupStore()
): any => {
  const wrapped = (
    <ChakraProvider>
      <Provider store={store}>
        <AlloProvider backend={alloBackend}>
          <DataLayerProvider client={dataLayerConfig}>
            <ReduxRouter store={store} history={history}>
              {ui}
            </ReduxRouter>
          </DataLayerProvider>
        </AlloProvider>
      </Provider>
    </ChakraProvider>
  );

  return { store, ...render(wrapped) };
};

export default {};
