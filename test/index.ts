import { expect } from "chai";
import { ethers } from "hardhat";

const owner = "0x909423e8D0B1163A65C73B6adA89A62a4ec7c544";
const tokenURI = "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR";

describe("GrantNFT", function () {
  it("creates a grantt", async function () {
    const GrantNFT = await ethers.getContractFactory("GrantNFT");
    const grantNft = await GrantNFT.deploy();
    await grantNft.deployed();

    await grantNft.mintGrant(owner, tokenURI);
    const ownerBalance = await grantNft.balanceOf(owner);

    console.log({ ownerBalance }, ownerBalance.toString());
    expect(ownerBalance.toString()).to.equal("1");
  });
});
