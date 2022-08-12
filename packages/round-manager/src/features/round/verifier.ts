// --- DIDKit tooling to verify credentials
import * as DIDKit from "@spruceid/didkit-wasm/didkit_wasm";

// --- Passport SDK Packages
import { PassportReader } from "@gitcoinco/passport-sdk-reader";
import { DIDKitLib, Passport, Stamp, VerifiableCredential } from "@gitcoinco/passport-sdk-types";

// --- PassportVerifier - Read and verify the content of a Passport
export class PassportVerifier {
    _DIDKit: DIDKitLib;
    _reader: PassportReader;
    _network: string;

    constructor(url = "https://ceramic.passport-iam.gitcoin.co", network = "1") {
        // attach an instance of the reader
        this._reader = new PassportReader(url, network);
        this._network = network;
    }

    async init(): Promise<void> {
        await new Promise((resolve) => resolve(DIDKit)).then(
            async (didkit: { default: Promise<DIDKitLib> } | DIDKitLib) => {
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

    // async verifyPassport(
    //     address: string,
    //     passport?: Passport,
    //     additionalStampChecks?: (stamp: Stamp) => boolean
    // ): Promise<Passport | false> {
    //     // get the passport
    //     const passportRecord = passport || (await this._reader.getPassport(address));
    //     // with a passport record...
    //     if (passportRecord) {
    //         const stamps = passportRecord.stamps as Stamp[];
    //
    //         return {
    //             ...passportRecord,
    //             stamps: await Promise.all(
    //                 stamps.map(async (stamp: Stamp) => {
    //                     // return the stamp with verifications in place
    //                     return (await this.verifyStamp(address, stamp, additionalStampChecks)) as Stamp;
    //                 })
    //             ),
    //         } as Passport;
    //     }
    //
    //     return false;
    // }

    // async verifyStamp(
    //     address: string,
    //     stamp: Stamp,
    //     additionalStampChecks?: (stamp: Stamp) => boolean
    // ): Promise<Stamp | false> {
    //     // given the stamp exists...
    //     if (stamp) {
    //         // mark as verified and check state
    //         stamp.verified = true;
    //
    //         // extract the stamps address
    //         const stampAddress = stamp.credential.credentialSubject.id
    //             .replace(`did:pkh:eip155:${this._network}:`, "")
    //             .toLowerCase();
    //
    //         // check the Passport address matches the credentialSubject address
    //         stamp.verified = stampAddress !== address.toLowerCase() ? false : stamp.verified;
    //
    //         // carry-out any additional verification check
    //         if (stamp.verified && additionalStampChecks) {
    //             stamp.verified = !additionalStampChecks(stamp) ? false : stamp.verified;
    //         }
    //
    //         // finally verify that the credential verifies with DIDKit
    //         if (stamp.verified) {
    //             stamp.verified = await this.verifyCredential(stamp.credential);
    //         }
    //     }
    //
    //     return stamp;
    // }

    async verifyCredential(credential: VerifiableCredential): Promise<boolean> {
        // ensure DIDKit is established
        if (!this._DIDKit) {
            await this.init();
        }

        // extract expirationDate
        const { expirationDate, proof } = credential;

        // check that the credential is still valid (not expired)
        if (new Date(expirationDate) > new Date()) {
            try {
                // parse the result of attempting to verify
                const verify = JSON.parse(
                    await this._DIDKit.verifyCredential(JSON.stringify(credential), `{"proofPurpose":"${proof.proofPurpose}"}`)
                ) as { checks: string[]; warnings: string[]; errors: string[] };

                // did we get any errors when we attempted to verify?
                return verify.errors.length === 0;
            } catch (e) {
                // if didkit throws, etc.
                return false;
            }
        } else {
            // past expiry :(
            return false;
        }
    }
}
