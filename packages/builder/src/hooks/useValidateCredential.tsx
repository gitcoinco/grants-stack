import { useEffect, useState } from "react";
import { PassportVerifier } from "@gitcoinco/passport-sdk-verifier";
import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { CredentialProvider } from "../types";

const IAM_SERVER = "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC";
const verifier = new PassportVerifier();

export default function useValidateCredential(
  vc: VerifiableCredential | undefined,
  providerId: CredentialProvider,
  handle: string | undefined
): { isValid: boolean; isLoading: boolean; error: any | null } {
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  async function validateCredential() {
    setIsLoading(true);

    try {
      console.log("validateCredential after try before if", {
        vc,
        providerId,
        handle,
      });
      if (vc && providerId && handle) {
        console.log("validateCredential after if", { vc, providerId, handle });
        const credential = vc;
        const validCredentialProvider =
          credential.credentialSubject.provider?.split("#")[1].toLowerCase() ===
          handle.toLowerCase();
        const validCredential = await verifier.verifyCredential(credential);
        const validIssuer = IAM_SERVER === credential.issuer;
        console.log("validateCredential after if", {
          validCredentialProvider,
          validCredential,
          validIssuer,
        });
        // TODO: add owner check
        // address of vc.credentialSubject.id should be a project owner
        setIsValid(validCredentialProvider && validCredential && validIssuer);
        console.log("validateCredential after if isValid state", { isValid });
      } else {
        setIsValid(false);
      }
    } catch (e: any) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    console.log("useValidateCredential useEffect", { vc, providerId, handle });
    validateCredential();
  }, [vc, providerId, handle]);

  console.log("useValidateCredential", { isValid, isLoading, error });

  return { isValid, isLoading, error };
}
