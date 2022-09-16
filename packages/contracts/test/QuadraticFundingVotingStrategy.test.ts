import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { BytesLike, isAddress } from "ethers/lib/utils";
import { artifacts, ethers } from "hardhat";
import { Artifact } from "hardhat/types";
import { QuadraticFundingVotingStrategy } from "../typechain";
import { Wallet } from "ethers";

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

    describe.only("test: vote", () => {
      const votes = [
        [Wallet.createRandom().address, 1, Wallet.createRandom().address],
        [Wallet.createRandom().address, 2, Wallet.createRandom().address],
      ];

      const encodedVotes: BytesLike[] = [];

      for (let i = 0; i < votes.length; i++) {
        encodedVotes.push(
          ethers.utils.defaultAbiCoder.encode(
            ["address", "uint256", "address"],
            votes[i]
          )
        );
      }

      it("invoking Vote with encoded votes SHOULD NOT revert", async () => {
        expect(quadraticFundingVotingStrategy.vote(encodedVotes, user.address)).to.not.be
          .reverted;
      });

      it("invoking vote with encoded votes should emit the Voted event", async () => {
        const txn = await quadraticFundingVotingStrategy.vote(encodedVotes, user.address);
        const receipt = await txn.wait();

        if (receipt.events) {
          for (let i = 0; i < receipt.events.length; i++) {
            const event = receipt.events[i];
            if (event.event === 'Voted') {
              expect(event.args).to.deep.equal({
                token: votes[i][0],
                amount: votes[i][1],
                voter: user.address,
                grantAddress: votes[i][2],
                roundAddress: quadraticFundingVotingStrategy.address,
              });
            }
          }
        }
      });
    });

  })

});
