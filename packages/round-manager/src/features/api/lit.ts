import { Buffer } from "buffer";
import { isJestRunning } from "common";
import { datadogLogs } from "@datadog/browser-logs";
import { getConfig } from "common/src/config";
import { getAddress } from "viem";

const LitJsSdk = isJestRunning() ? null : require("gitcoin-lit-js-sdk");
const isV2 = getConfig().allo.version === "allo-v2";

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
  chainId: number;
  contract: string;
};

export class Lit {
  /* Lit doesn't provide types as of 12. 9. 2022 */
  chainId: number;
  contract: string;

  /**
   * constructor
   * @param initConfig {chain, contract, wallet}
   */
  constructor(initConfig: LitInit) {
    this.chainId = initConfig.chainId;
    this.contract = getAddress(initConfig.contract);
  }

  /**
   * Generates access control conditions for the role operator
   * @returns
   */
  isRoundOperatorAccessControl() {
    if (isV2) {
      return [
        {
          conditionType: "evmContract",
          contractAddress: this.contract,
          functionName: "isValidAllocator",
          functionParams: [":userAddress"],
          functionAbi: {
            inputs: [
              { name: "_allocator", type: "address", internalType: "address" },
            ],
            name: "isValidAllocator",
            outputs: [{ name: "", type: "bool", internalType: "bool" }],
            stateMutability: "view",
            type: "function",
          },
          chain: this.chainIdToChainName(this.chainId),
          returnValueTest: {
            key: "",
            comparator: "=",
            value: "true",
          },
        },
      ];
    }

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
        chain: this.chainIdToChainName(this.chainId),
        returnValueTest: {
          key: "",
          comparator: "=",
          value: "true",
        },
      },
    ];
  }

  chainIdToChainName(chainId: number): string {
    for (const name in LitJsSdk.LIT_CHAINS) {
      if (LitJsSdk.LIT_CHAINS[name].chainId === chainId) {
        return name;
      }
    }

    throw new Error(`couldn't find LIT chain name for chainId ${chainId}`);
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
    const chain = this.chainIdToChainName(this.chainId);
    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });

    // Encrypting Content and generating symmetric key
    const { encryptedString, symmetricKey } =
      await LitJsSdk.encryptString(content);

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
      const chain = this.chainIdToChainName(this.chainId);

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
