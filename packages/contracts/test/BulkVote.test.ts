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
  let roundStartTime: number;
  let roundEndTime: number;
  let bulkVoteArtifact: Artifact;
  

  describe('contract deployment', () => {


    before(async () => {
      [user] = await ethers.getSigners();
      roundStartTime = Math.floor(new Date().getTime() / 1000); // time in seconds
      roundEndTime = roundStartTime + 86400; // One day

      bulkVoteArtifact = await artifacts.readArtifact('BulkVote');
    });


    it('deploy fails when startTime is in the past', async () => {
      const newRoundStartTime = roundStartTime - 86400;
  
      const bulkVote = deployContract(user, bulkVoteArtifact, [newRoundStartTime, roundEndTime]);
            
      await expect(bulkVote).to.be.revertedWith(
        'BulkVote: Start time has already passed'
      )
    });

    it('deploy fails when startTime > endTime', async () => {
      const newRoundEndTime = roundStartTime - 86400;
  
      const bulkVote = deployContract(user, bulkVoteArtifact, [roundStartTime, newRoundEndTime]);

      await expect(bulkVote).to.be.revertedWith(
        "BulkVote: End time must be after start time"
      );
    });


    it('deploys properly', async () => {

      const bulkVoteArtifact: Artifact = await artifacts.readArtifact('BulkVote');

      const bulkVote = <BulkVote>await deployContract(user, bulkVoteArtifact, [roundStartTime, roundEndTime]);

      // Verify deploy
      expect(isAddress(bulkVote.address), 'Failed to deploy BulkVote').to.be.true;

      // Verify constructor parameters
      expect(await bulkVote.roundStartTime()).to.equal(roundStartTime);
      expect(await bulkVote.roundEndTime()).to.equal(roundEndTime);
    });
  });


  it('core functions', () => {

    before(async () => {
      [user] = await ethers.getSigners();
  
      roundStartTime = Math.floor(new Date().getTime() / 1000); // time in seconds
      roundEndTime = roundStartTime + 86400; // One day
  
      // Deploy BulkVote contract
      const bulkVoteArtifact: Artifact = await artifacts.readArtifact('BulkVote');
      bulkVote = <BulkVote>await deployContract(user, bulkVoteArtifact, [roundStartTime, roundEndTime]);
    });

    
  })

});
