import { ethers } from "ethers";
import { Buffer } from "buffer";
import { Provider } from "@wagmi/core";
import { isJestRunning } from "../utils/utils";
import { global } from "../global";

const LitJsSdk = isJestRunning() ? null : require("lit-js-sdk");
// @ts-ignore
window.Buffer = Buffer;

const client = LitJsSdk ? new LitJsSdk.LitNodeClient() : null;

const ROUND_OPERATOR =
  "0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5";

type LitInit = {
  chain: string;
  contract: string;
};

interface LitProvider extends Provider {
  listAccounts?: () => string[];
  getSigner?: () => any;
}

export default class Lit {
  litNodeClient: any;

  chain: string;

  contract: string;

  /**
   * constructor
   * @param initConfig {chain, contract, wallet}
   */
  constructor(initConfig: LitInit) {
    this.chain = initConfig.chain;
    this.contract = ethers.utils.getAddress(initConfig.contract);
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

    const litProvider: LitProvider = global.web3Provider as Provider;

    litProvider.getSigner = () => global.signer;
    litProvider.listAccounts = () => [global.address as string];

    // Obtain Auth Signature to verify signer is wallet owner
    const authSig = await LitJsSdk.checkAndSignAuthMessage({
      chain: this.chain,
      customProvider: litProvider,
    });

    // Encrypting Content and generating symmetric key
    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(
      content
    );

    // Saving the Encrypted Content to the Lit Nodes
    const encryptedSymmetricKey = await this.litNodeClient.saveEncryptionKey({
      unifiedAccessControlConditions: this.isRoundOperatorAccessControl(),
      symmetricKey,
      authSig,
      chain: this.chain,
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
  async decryptString(encryptedStr: string, encryptedSymmetricKey: string) {
    if (!this.litNodeClient) {
      await this.connect();
    }
    // Obtain Auth Signature to verify signer is wallet owner
    const authSig = await LitJsSdk.checkAndSignAuthMessage({
      chain: this.chain,
    });

    // Obtaining the Decrypted Symmetric Key
    const symmetricKey = await this.litNodeClient.getEncryptionKey({
      unifiedAccessControlConditions: this.isRoundOperatorAccessControl(),
      toDecrypt: encryptedSymmetricKey,
      chain: this.chain,
      authSig,
    });

    // Obtaining the Decrypted Data
    const decryptedString = await LitJsSdk.decryptString(
      encryptedStr,
      symmetricKey
    );

    return decryptedString;
  }
}
