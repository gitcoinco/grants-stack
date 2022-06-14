import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { isAddress } from "ethers/lib/utils";
import { artifacts, ethers } from "hardhat";
import { Artifact } from "hardhat/types";
import { BulkVotingStrategy } from "../typechain";

describe("BulkVotingStrategy", function () {

  let user: SignerWithAddress;
  let bulkVotingStrategy: BulkVotingStrategy;
  let bulkVotingStrategyArtifact: Artifact;


  describe('constructor', () => {

    it('deploys properly', async () => {

      [user] = await ethers.getSigners();

      bulkVotingStrategyArtifact = await artifacts.readArtifact('BulkVotingStrategy');
      bulkVotingStrategy = <BulkVotingStrategy>await deployContract(user, bulkVotingStrategyArtifact, []);

      // Verify deploy
      expect(isAddress(bulkVotingStrategy.address), 'Failed to deploy BulkVotingStrategy').to.be.true;
    });
  })


  describe('core functions', () => {

    before(async () => {
      [user] = await ethers.getSigners();

      // Deploy BulkVotingStrategy contract
      bulkVotingStrategyArtifact = await artifacts.readArtifact('BulkVotingStrategy');
      bulkVotingStrategy = <BulkVotingStrategy>await deployContract(user, bulkVotingStrategyArtifact, []);
    });

  })

});
