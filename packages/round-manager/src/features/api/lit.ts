import { Buffer } from "buffer";
import { isJestRunning } from "./utils";

const LitJsSdk = isJestRunning() ? null : require("lit-js-sdk");

window.Buffer = Buffer;

const client = LitJsSdk
  ? new LitJsSdk.LitNodeClient({
      alertWhenUnauthorized: false,
    })
  : null;

const ROUND_OPERATOR =
  "0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5";

type LitInit = {
  chain: string;
  contract: string;
};
export class Lit {
  /* Lit doesn't provide types as of 12. 9. 2022 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  litNodeClient: any;
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
   * Connect to the lit node
   */
  async connect() {
    await client.connect();
    this.litNodeClient = client;
  }

  /**
   * Util function to encrypt a string
   *
   * @param content the string to encrypt
   * @returns {encryptedString, encryptedSymmetricKey}
   */
  async encryptString(content: string) {
    if (!this.litNodeClient) {
      await this.connect();
    }

    // Obtain Auth Signature to verify signer is wallet owner
    const chain = this.chain;
    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });

    // Encrypting Content and generating symmetric key
    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(
      content
    );

    // Saving the Encrypted Content to the Lit Nodes
    const encryptedSymmetricKey = await this.litNodeClient.saveEncryptionKey({
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
    if (!this.litNodeClient) {
      await this.connect();
    }

    try {
      const chain = this.chain;

      // Obtain Auth Signature to verify signer is wallet owner
      const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });

      // Obtaining the Decrypted Symmetric Key
      const symmetricKey = await this.litNodeClient.getEncryptionKey({
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
      console.error(error);
      return "N/A";
    }
  }
}
