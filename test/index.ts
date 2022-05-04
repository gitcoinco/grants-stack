// import { ContractTransaction } from "@ethersproject/contracts";
import { expect } from "chai";
import { ethers } from "hardhat";
// import { utils } from "ethers";
import { GrantNFT } from "../typechain";

// const owner = "0x909423e8D0B1163A65C73B6adA89A62a4ec7c544";
const tokenURI = "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR";
const tokenURI1 = "QmeNUbj4YdX6cQ2Bv4doKNSQQ2hum8Cp7zk9KVMdPYRVNt";

describe("GrantNFT", function () {
  // let grant: ContractTransaction;
  const grantId: number = 1;
  let grantNFT: GrantNFT;
  let grantOwner: string;

  beforeEach("deploy TickTest", async () => {
    const grantNFTContract = await ethers.getContractFactory("GrantNFT");
    grantNFT = (await grantNFTContract.deploy()) as GrantNFT;
    await grantNFT.deployed();

    const [owner] = await ethers.getSigners();
    grantOwner = owner.address;
  });

  it("creates a grant", async function () {
    await grantNFT.mintGrant(grantOwner, tokenURI);
    const ownerBalance = await grantNFT.balanceOf(grantOwner);
    expect(ownerBalance.toString()).to.equal("1");
  });

  it("updates a grant", async function () {
    await grantNFT.mintGrant(grantOwner, tokenURI);
    await grantNFT.updateGrant(grantId, tokenURI1);
    const newTokenURI = await grantNFT.tokenURI(grantId);
    expect(newTokenURI).to.equal(tokenURI1);
  });
});
