import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-abi-exporter";

dotenv.config();

const chainIds = {
  hardhat: 31337,
  mainnet: 1,
  goerli: 5,
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
  console.warn("Please set your DEPLOYER_PRIVATE_KEY in a .env file");
  deployPrivateKey =
    "0x0000000000000000000000000000000000000000000000000000000000000001";
}


const infuraIdKey = process.env.INFURA_ID as string;
if (!infuraIdKey) {
  console.warn("Please set your INFURA_ID in a .env file");
}


function createTestnetConfig(
  network: keyof typeof chainIds
): NetworkUserConfig {
  const url: string = `https://${network}.infura.io/v3/${infuraIdKey}`;
  return {
    accounts: [deployPrivateKey],
    chainId: chainIds[network],
    allowUnlimitedContractSize: true,
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

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    mainnet: {
      url: `https://mainnet.infura.io/v3/${infuraIdKey}`,
      chainId: chainIds['mainnet'],
      accounts: [deployPrivateKey]
    },
    goerli: createTestnetConfig("goerli")
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  abiExporter: abiExporter,
};

export default config;
