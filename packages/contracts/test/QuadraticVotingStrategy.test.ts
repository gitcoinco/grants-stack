import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { isAddress } from "ethers/lib/utils";
import { artifacts, ethers } from "hardhat";
import { Artifact } from "hardhat/types";
import { QuadraticVotingStrategy } from "../typechain";
import { BigNumber, utils } from "ethers";

describe("QuadraticVotingStrategy", function () {
  let user0: SignerWithAddress;
  let user1: SignerWithAddress;
  let QuadraticVotingStrategy: QuadraticVotingStrategy;
  let QuadraticVotingStrategyArtifact: Artifact;

  describe("constructor", () => {
    it("deploys properly", async () => {
      [user0, user1] = await ethers.getSigners();

      QuadraticVotingStrategyArtifact = await artifacts.readArtifact(
        "QuadraticVotingStrategy"
      );
      QuadraticVotingStrategy = <QuadraticVotingStrategy>(
        await deployContract(user0, QuadraticVotingStrategyArtifact, [1000, '0xa3374B34A855b0bF6b96401D8c367608d9c8a048'])
      );

      // Verify deploy
      // eslint-disable-next-line no-unused-expressions
      expect(
        isAddress(QuadraticVotingStrategy.address),
        "Failed to deploy QuadraticVotingStrategy"
      ).to.be.true;
    });
  });

  describe("core functions", () => {
    before(async () => {
      [user0, user1] = await ethers.getSigners();

      // Deploy QuadraticVotingStrategy contract
      QuadraticVotingStrategyArtifact = await artifacts.readArtifact(
        "QuadraticVotingStrategy"
      );
      QuadraticVotingStrategy = <QuadraticVotingStrategy>(
        await deployContract(user0, QuadraticVotingStrategyArtifact, [1000, '0xa3374B34A855b0bF6b96401D8c367608d9c8a048'])
      );
    });

  });

});
