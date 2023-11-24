import {
  VerifiableCredential,
  PROVIDER_ID,
} from "@gitcoinco/passport-sdk-types";
import { PassportVerifier } from "@gitcoinco/passport-sdk-verifier";
import useSWR from "swr";
import { Project } from "../../api/types";

enum VerifiedCredentialState {
  VALID,
  INVALID,
  PENDING,
}

const IAM_SERVER = "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC";

const verifier = new PassportVerifier();

export function useVerifyProject(project?: Project) {
  const { credentials = {} } = project?.projectMetadata ?? {};

  // Return data as { twitter?: boolean, ... }
  return useSWR<{ [K in Lowercase<PROVIDER_ID>]?: boolean }>(credentials, () =>
    Promise.all(
      // Check verifications for all credentials in project metadata
      Object.entries(credentials).map(async ([provider, credential]) => ({
        provider,
        verified: await isVerified(credential, verifier, provider, project),
      }))
    ).then((verifications) =>
      // Convert to object ({ [provider]: isVerified })
      verifications.reduce(
        (acc, x) => ({
          ...acc,
          [x.provider]: x.verified === VerifiedCredentialState.VALID,
        }),
        {}
      )
    )
  );
}

function vcProviderMatchesProject(
  provider: string,
  verifiableCredential: VerifiableCredential,
  project: Project | undefined
) {
  let vcProviderMatchesProject = false;
  if (provider === "twitter") {
    vcProviderMatchesProject =
      verifiableCredential.credentialSubject.provider
        ?.split("#")[1]
        .toLowerCase() ===
      project?.projectMetadata.projectTwitter?.toLowerCase();
  } else if (provider === "github") {
    vcProviderMatchesProject =
      verifiableCredential.credentialSubject.provider
        ?.split("#")[1]
        .toLowerCase() ===
      project?.projectMetadata.projectGithub?.toLowerCase();
  }
  return vcProviderMatchesProject;
}

function vcIssuedToAddress(vc: VerifiableCredential, address: string) {
  const vcIdSplit = vc.credentialSubject.id.split(":");
  const addressFromId = vcIdSplit[vcIdSplit.length - 1];
  return addressFromId === address;
}

async function isVerified(
  verifiableCredential: VerifiableCredential,
  verifier: PassportVerifier,
  provider: string,
  project: Project | undefined
) {
  const vcHasValidProof = await verifier.verifyCredential(verifiableCredential);
  const vcIssuedByValidIAMServer = verifiableCredential.issuer === IAM_SERVER;
  const providerMatchesProject = vcProviderMatchesProject(
    provider,
    verifiableCredential,
    project
  );
  const vcIssuedToAtLeastOneProjectOwner = (
    project?.projectMetadata?.owners ?? []
  ).some((owner) => vcIssuedToAddress(verifiableCredential, owner.address));

  return vcHasValidProof &&
    vcIssuedByValidIAMServer &&
    providerMatchesProject &&
    vcIssuedToAtLeastOneProjectOwner
    ? VerifiedCredentialState.VALID
    : VerifiedCredentialState.INVALID;
}
