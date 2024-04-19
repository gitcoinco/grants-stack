/* eslint-disable @typescript-eslint/no-explicit-any */

// --- Passport SDK Packages
import { DIDKitLib, VerifiableCredential } from "@gitcoinco/passport-sdk-types";

// --- DIDKit tooling to verify credentials
import * as DIDKit from "@spruceid/didkit-wasm";

// --- PassportVerifier - Read and verify the content of a Passport
export class PassportVerifierWithExpiration {
  _DIDKit: DIDKitLib | any;

  constructor() {
    this.init();
  }

  async init(): Promise<void> {
    // webpacks `experiments.asyncWebAssembly=true` option imports the wasm asynchronously but typescript
    // doesn't recognise the import as a Promise, so we wrap it in a Promise and resolve before using...
    await new Promise((resolve) => resolve(DIDKit)).then(
      async (didkit: { default: Promise<DIDKitLib> } | DIDKitLib | any) => {
        if (didkit.default) {
          await Promise.resolve(didkit.default).then((didkit) => {
            this._DIDKit = didkit as typeof DIDKit;
          });
        } else {
          this._DIDKit = didkit as typeof DIDKit;
        }
      }
    );
  }

  async verifyCredential(credential: VerifiableCredential): Promise<boolean> {
    // ensure DIDKit is established
    if (!this._DIDKit) {
      await this.init();
    }

    // extract expirationDate
    // const { expirationDate, proof } = credential;
    const { proof } = credential;

    // check that the credential is still valid (not expired)
    // if (new Date(expirationDate) > new Date()) {
    try {
      // parse the result of attempting to verify
      const verify = JSON.parse(
        await this._DIDKit.verifyCredential(
          JSON.stringify(credential),
          `{"proofPurpose":"${proof.proofPurpose}"}`
        )
      ) as { checks: string[]; warnings: string[]; errors: string[] };

      // did we get any errors when we attempted to verify?
      return verify.errors.length === 0;
    } catch (e) {
      // if didkit throws, etc.
      return false;
    }
    // } else {
    //   // past expiry :(
    //   return false;
    // }
  }
}
