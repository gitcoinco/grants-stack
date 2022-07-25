// This script deals with applying to round. (done 3 times)
// Ideally this would be done via the hub and not this script
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../utils/script-utils";
import { roundParams } from '../config/round.config';


const projectApplications  = [
  {
    project: "0x5cdb35fADB8262A3f88863254c870c2e6A848CcA",
    metaPtr: {
      protocol: 1,
      pointer: "bafybeiekytxwrrfzxvuq3ge5glfzlhkuxjgvx2qb4swodhqd3c3mtc5jay"
    }
  },

  {
    project: "0x1bCD46B724fD4C08995CEC46ffd51bD45feDE200",
    metaPtr: {
      protocol: 1,
      pointer: "bafybeih2pise44gkkzj7fdws3knwotppnh4x2gifnbxjtttuv7okw4mjzu"
    }
  },

  {
    project: "0x500Df079BEBE24A9f6FFa2c70fb58000A4722784",
    metaPtr: {
      protocol: 1,
      pointer: "bafybeiceggy6uzfxsn3z6b2rraptp3g2kx2nrwailkjnx522yah43g5tyu"
    }
  }
];

export async function main() {

  const network = hre.network;

  const networkParams = roundParams[network.name];

  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  const contract = networkParams.roundContract;
  if (!contract) {
    throw new Error(`Missing round contract for network ${network.name}`);
  }

  const round = await ethers.getContractAt('RoundImplementation', contract);
  
  await confirmContinue({
    "contract"                     : "RoundImplementation -  Apply 3 projects",
    "round"                        : contract,
    "network"                      : network.name,
    "chainId"                      : network.config.chainId
  });

  for (let i = 0; i < projectApplications.length; i++) {
    const project = projectApplications[i];
    const updateTx = await round.applyToRound(
      ethers.utils.hexZeroPad(project.project, 32),
      project.metaPtr
    );
    await updateTx.wait();
    console.log("✅ project applied: ", updateTx.hash);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
