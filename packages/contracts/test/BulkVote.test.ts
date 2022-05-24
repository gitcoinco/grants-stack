import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { isAddress } from "ethers/lib/utils";
import { artifacts, ethers } from "hardhat";
import { Artifact } from "hardhat/types";
import { BulkVote } from "../typechain";

describe("BulkVote", function () {

  let user: SignerWithAddress;
  let bulkVote: BulkVote;
  let bulkVoteArtifact: Artifact;


  describe('constructor', () => {

    it('deploys properly', async () => {

      [user] = await ethers.getSigners();

      bulkVoteArtifact = await artifacts.readArtifact('BulkVote');
      bulkVote = <BulkVote>await deployContract(user, bulkVoteArtifact, []);

      // Verify deploy
      expect(isAddress(bulkVote.address), 'Failed to deploy BulkVote').to.be.true;
    });
  })


  describe('core functions', () => {

    before(async () => {
      [user] = await ethers.getSigners();

      // Deploy BulkVote contract
      bulkVoteArtifact = await artifacts.readArtifact('BulkVote');
      bulkVote = <BulkVote>await deployContract(user, bulkVoteArtifact, []);
    });

  })

});
