/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { debounce } from "ts-debounce";
import { PassportVerifierWithExpiration } from "./credentialVerifier";

const IAM_SERVER = [
  "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC",
  "did:ethr:0xd6f8d6ca86aa01e551a311d670a0d1bd8577e5fb",
];

const verifier = new PassportVerifierWithExpiration();

export async function validateCredential(
  credential: VerifiableCredential | undefined,
  handle: string | undefined
): Promise<boolean> {
  if (!credential || !handle) {
    return false;
  }

  const validCredentialProvider =
    credential.credentialSubject.provider?.split("#")[1].toLowerCase() ===
    handle.toLowerCase();
  const validCredential = await verifier.verifyCredential(credential);

  const validIssuer = IAM_SERVER.includes(credential.issuer);

  return validCredentialProvider && validCredential && validIssuer;
}

export function useValidateCredential(
  vc: VerifiableCredential | undefined,
  handle: string | undefined
): { isValid: boolean; isLoading: boolean; error: any | null } {
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const hookValidateCredential = debounce(async () => {
    setIsLoading(true);

    try {
      if (vc && handle) {
        setIsValid(await validateCredential(vc, handle));
      } else {
        setIsValid(false);
      }
    } catch (e: any) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, 500);

  useEffect(() => {
    hookValidateCredential();
  }, [vc, handle]);

  return { isValid, isLoading, error };
}
