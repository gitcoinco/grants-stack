import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { isAddress } from "ethers/lib/utils";
import { artifacts, ethers } from "hardhat";
import { Artifact } from "hardhat/types";
import { QuadraticFundingVotingStrategy } from "../typechain";

describe("QuadraticFundingVotingStrategy", function () {

  let user: SignerWithAddress;
  let quadraticFundingVotingStrategy: QuadraticFundingVotingStrategy;
  let quadraticFundingVotingStrategyArtifact: Artifact;


  describe('constructor', () => {

    it('deploys properly', async () => {

      [user] = await ethers.getSigners();

      quadraticFundingVotingStrategyArtifact = await artifacts.readArtifact('QuadraticFundingVotingStrategy');
      quadraticFundingVotingStrategy = <QuadraticFundingVotingStrategy>await deployContract(user, quadraticFundingVotingStrategyArtifact, []);

      // Verify deploy
      expect(isAddress(quadraticFundingVotingStrategy.address), 'Failed to deploy QuadraticFundingVotingStrategy').to.be.true;
    });
  })


  describe('core functions', () => {

    before(async () => {
      [user] = await ethers.getSigners();

      // Deploy QuadraticFundingVotingStrategy contract
      quadraticFundingVotingStrategyArtifact = await artifacts.readArtifact('QuadraticFundingVotingStrategy');
      quadraticFundingVotingStrategy = <QuadraticFundingVotingStrategy>await deployContract(user, quadraticFundingVotingStrategyArtifact, []);
    });

  })

});
