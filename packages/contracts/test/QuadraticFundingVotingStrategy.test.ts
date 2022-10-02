import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { BytesLike, isAddress } from "ethers/lib/utils";
import { artifacts, ethers } from "hardhat";
import { Artifact } from "hardhat/types";
import { MockERC20, QuadraticFundingVotingStrategy } from "../typechain";
import { Wallet } from "ethers";

describe("QuadraticFundingVotingStrategy", function () {

  let user: SignerWithAddress;
  let quadraticFundingVotingStrategy: QuadraticFundingVotingStrategy;
  let quadraticFundingVotingStrategyArtifact: Artifact;

  let mockERC20: MockERC20;
  let mockERC20Artifact: Artifact;
  describe('constructor', () => {

    it('deploys properly', async () => {

      [user] = await ethers.getSigners();

      quadraticFundingVotingStrategyArtifact = await artifacts.readArtifact('QuadraticFundingVotingStrategy');
      quadraticFundingVotingStrategy = <QuadraticFundingVotingStrategy>await deployContract(user, quadraticFundingVotingStrategyArtifact, []);
      
      mockERC20Artifact = await artifacts.readArtifact('MockERC20');
      mockERC20 = <MockERC20>await deployContract(user, mockERC20Artifact, ['18']);
      
      // Verify deploy
      expect(isAddress(quadraticFundingVotingStrategy.address), 'Failed to deploy QuadraticFundingVotingStrategy').to.be.true;
      expect(isAddress(mockERC20.address), 'Failed to deploy MockERC20').to.be.true;

    });
  })


  describe.only('core functions', () => {

    before(async () => {
      [user] = await ethers.getSigners();
      // Deploy QuadraticFundingVotingStrategy contract
      quadraticFundingVotingStrategyArtifact = await artifacts.readArtifact('QuadraticFundingVotingStrategy');
      quadraticFundingVotingStrategy = <QuadraticFundingVotingStrategy>await deployContract(user, quadraticFundingVotingStrategyArtifact, []);
      mockERC20Artifact = await artifacts.readArtifact('MockERC20');
      mockERC20 = <MockERC20>await deployContract(user, mockERC20Artifact, ['18']);
    });
    
    it("votes properly", async () => {
      const votes = [
        [mockERC20.address, 100, Wallet.createRandom().address],
        [mockERC20.address, 100, Wallet.createRandom().address],
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
      expect(quadraticFundingVotingStrategy.vote(encodedVotes, user.address)).to.not.be.reverted;
      const txn = await quadraticFundingVotingStrategy.vote(encodedVotes, user.address);
      const receipt = await txn.wait();

      if (receipt.events) {
        for (let i = 0; i < receipt.events.length; i++) {
          const event = receipt.events[i];
          if (event.event === 'Voted') {
            expect(event.args).to.deep.equal({
              token: mockERC20.address,
              amount: 100,
              voter: user.address,
              grantAddress: votes[i][2],
              roundAddress: quadraticFundingVotingStrategy.address,
            });
          }
        }
      }
    });

  })

});
