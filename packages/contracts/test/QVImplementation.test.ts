import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { isAddress } from "ethers/lib/utils";
import { artifacts, ethers } from "hardhat";
import { Artifact } from "hardhat/types";
import { QVImplementation } from "../typechain";
import { BigNumber, utils } from "ethers";

describe("QVImplementation", function () {
  let user0: SignerWithAddress;
  let user1: SignerWithAddress;
  let QVImplementation: QVImplementation;
  let QVImplementationArtifact: Artifact;

  describe("constructor", () => {
    it("deploys properly", async () => {
      [user0, user1] = await ethers.getSigners();

      QVImplementationArtifact = await artifacts.readArtifact(
        "QVImplementation"
      );
      QVImplementation = <QVImplementation>(
        await deployContract(user0, QVImplementationArtifact,[])
      );

      // Verify deploy
      // eslint-disable-next-line no-unused-expressions
      expect(
        isAddress(QVImplementation.address),
        "Failed to deploy QVImplementation"
      ).to.be.true;
    });
  });

  describe("core functions", () => {
    before(async () => {
      [user0, user1] = await ethers.getSigners();

      // Deploy QVImplementation contract
      QVImplementationArtifact = await artifacts.readArtifact(
        "QVImplementation"
      );
      QVImplementation = <QVImplementation>(
        await deployContract(user0, QVImplementationArtifact,[])
      );
    });

  });

});
