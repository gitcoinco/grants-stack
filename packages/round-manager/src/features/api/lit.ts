import { Buffer } from "buffer";
import { isJestRunning } from "common";
import { datadogLogs } from "@datadog/browser-logs";

const LitJsSdk = isJestRunning() ? null : require("lit-js-sdk-old-w-pgn");

window.Buffer = Buffer;

const litClient = LitJsSdk
  ? new LitJsSdk.LitNodeClient({
      alertWhenUnauthorized: false,
    })
  : null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LitClient = any;
let connectedLitClient: Promise<LitClient> | undefined;

function getClient(): Promise<LitClient> {
  if (connectedLitClient) {
    return connectedLitClient;
  }
  const promise = litClient.connect().then(() => litClient);
  connectedLitClient = promise;
  return promise;
}

const ROUND_OPERATOR =
  "0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5";

type LitInit = {
  chain: string;
  contract: string;
};

export class Lit {
  /* Lit doesn't provide types as of 12. 9. 2022 */
  chain: string;
  contract: string;

  /**
   * constructor
   * @param initConfig {chain, contract, wallet}
   */
  constructor(initConfig: LitInit) {
    this.chain = initConfig.chain;
    this.contract = initConfig.contract;
  }

  /**
   * Generates access control conditions for the role operator
   * @returns
   */
  isRoundOperatorAccessControl() {
    return [
      {
        conditionType: "evmContract",
        contractAddress: this.contract,
        functionName: "hasRole",
        functionParams: [ROUND_OPERATOR, ":userAddress"],
        functionAbi: {
          inputs: [
            { internalType: "bytes32", name: "role", type: "bytes32" },
            { internalType: "address", name: "account", type: "address" },
          ],
          name: "hasRole",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "view",
          type: "function",
        },
        chain: this.chain,
        returnValueTest: {
          key: "",
          comparator: "=",
          value: "true",
        },
      },
    ];
  }

  /**
   * Util function to encrypt a string
   *
   * @param content the string to encrypt
   * @returns {encryptedString, encryptedSymmetricKey}
   */
  async encryptString(content: string) {
    const client = await getClient();

    // Obtain Auth Signature to verify signer is wallet owner
    const chain = this.chain;
    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });

    // Encrypting Content and generating symmetric key
    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(
      content
    );

    // Saving the Encrypted Content to the Lit Nodes
    const encryptedSymmetricKey = await client.saveEncryptionKey({
      unifiedAccessControlConditions: this.isRoundOperatorAccessControl(),
      symmetricKey,
      authSig,
      chain,
    });

    return {
      encryptedString,
      encryptedSymmetricKey: LitJsSdk.uint8arrayToString(
        encryptedSymmetricKey,
        "base16"
      ),
    };
  }

  /**
   * Util function to decrypt a string
   *
   * @param encryptedStr
   * @param encryptedSymmetricKey
   * @returns decrypted string
   */
  async decryptString(
    encryptedStr: string | Blob,
    encryptedSymmetricKey: string
  ) {
    const client = await getClient();

    try {
      const chain = this.chain;

      // Obtain Auth Signature to verify signer is wallet owner
      const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });

      // Obtaining the Decrypted Symmetric Key
      const symmetricKey = await client.getEncryptionKey({
        unifiedAccessControlConditions: this.isRoundOperatorAccessControl(),
        toDecrypt: encryptedSymmetricKey,
        chain,
        authSig,
      });

      // Obtaining the Decrypted Data
      const decryptedString = await LitJsSdk.decryptString(
        encryptedStr,
        symmetricKey
      );

      return decryptedString;
    } catch (error) {
      datadogLogs.logger.error(`error: decryptString - ${error}`);
      console.error("decryptString", error);
      return "N/A";
    }
  }
}
