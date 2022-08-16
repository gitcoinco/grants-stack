import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import '@primitivefi/hardhat-dodoc';
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-abi-exporter";

dotenv.config();

const chainIds = {
  "hardhat"           : 31337,
  "mainnet"           : 1,
  "goerli"            : 5,
  "optimism-mainnet"  : 10,
  "optimism-kovan"    : 69
};


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});


let deployPrivateKey = process.env.DEPLOYER_PRIVATE_KEY as string;
if (!deployPrivateKey) {
  deployPrivateKey =
    "0x0000000000000000000000000000000000000000000000000000000000000001";
}


const infuraIdKey = process.env.INFURA_ID as string;

/**
 * Generates hardhat network configuration the test networks.
 * @param network
 * @param url (optional)
 * @returns {NetworkUserConfig}
 */
function createTestnetConfig(
  network: keyof typeof chainIds,
  url?: string
): NetworkUserConfig {
  if(!url) {
    url = `https://${network}.infura.io/v3/${infuraIdKey}`;
  }
  return {
    accounts: [deployPrivateKey],
    chainId: chainIds[network],
    allowUnlimitedContractSize: true,
    url,
  };
}


/**
 * Generates hardhat network configuration the mainnet networks.
 * @param network
 * @returns {NetworkUserConfig}
 */
function createMainnetConfig(
  network: keyof typeof chainIds
): NetworkUserConfig {
  const url: string = `https://${network}.infura.io/v3/${infuraIdKey}`;
  return {
    accounts: [deployPrivateKey],
    chainId: chainIds[network],
    url,
  };
}


const abiExporter = [
  {
    path: './abis/pretty',
    flat: true,
    clear: true,
    format: "fullName",
  },
  {
    path: './abis/ugly',
    flat: true,
    clear: true,
  }
];

const dodoc = {
  outputDir: './docs/contracts',
  exclude: [
    'contracts/dummy',
  ]
}

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    // Main Networks
    "mainnet": createMainnetConfig("mainnet"),
    "optimism-mainnet": createMainnetConfig("optimism-mainnet"),

    // Test Networks
    "goerli": createTestnetConfig("goerli"),
    "optimism-kovan": createTestnetConfig("optimism-kovan", "https://kovan.optimism.io")
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: {
      goerli: process.env.ETHERSCAN_API_KEY,
      optimisticEthereum: process.env.OPTIMISTIC_ETHERSCAN_API_KEY,
      optimisticKovan: process.env.OPTIMISTIC_ETHERSCAN_API_KEY,
    }
  },
  abiExporter: abiExporter,
  dodoc: dodoc
};

export default config;
