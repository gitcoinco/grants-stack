import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { BytesLike, isAddress } from "ethers/lib/utils";
import { artifacts, ethers } from "hardhat";
import { Artifact } from "hardhat/types";
import { MockERC20, QuadraticFundingVotingStrategyImplementation } from "../../typechain";
import { Event, Wallet } from "ethers";
import { AddressZero } from "@ethersproject/constants";

describe("QuadraticFundingVotingStrategyImplementation", () =>  {

  let user: SignerWithAddress;
  let quadraticFundingVotingStrategy: QuadraticFundingVotingStrategyImplementation;
  let quadraticFundingVotingStrategyArtifact: Artifact;

  let mockERC20: MockERC20;
  let mockERC20Artifact: Artifact;

  const tokensToBeMinted = 1000;

  describe('constructor', () => {

    it('deploys properly', async () => {

      [user] = await ethers.getSigners();

      quadraticFundingVotingStrategyArtifact = await artifacts.readArtifact('QuadraticFundingVotingStrategyImplementation');
      quadraticFundingVotingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, quadraticFundingVotingStrategyArtifact, []);

      mockERC20Artifact = await artifacts.readArtifact('MockERC20');
      mockERC20 = <MockERC20>await deployContract(user, mockERC20Artifact, [tokensToBeMinted]);

      // Verify deploy
      expect(isAddress(quadraticFundingVotingStrategy.address), 'Failed to deploy QuadraticFundingVotingStrategyImplementation').to.be.true;
      expect(isAddress(mockERC20.address), 'Failed to deploy MockERC20').to.be.true;

      // Verify default value
      expect(await quadraticFundingVotingStrategy.roundAddress()).to.equal(AddressZero);
    });
  })


  describe('core functions', () => {

    const randomAddress = Wallet.createRandom().address;

    const grant1 = Wallet.createRandom();
    const grant1TokenTransferAmount = 150;

    const grant2 = Wallet.createRandom();
    const grant2TokenTransferAmount = 50;
    let encodedVotes: BytesLike[] = [];

    const totalTokenTransfer = grant1TokenTransferAmount + grant2TokenTransferAmount;


    describe('test: init',() => {
      beforeEach(async () => {
        [user] = await ethers.getSigners();

        // Deploy MockERC20 contract
        mockERC20Artifact = await artifacts.readArtifact('MockERC20');
        mockERC20 = <MockERC20>await deployContract(user, mockERC20Artifact, [tokensToBeMinted]);

        // Deploy QuadraticFundingVotingStrategy contract
        quadraticFundingVotingStrategyArtifact = await artifacts.readArtifact('QuadraticFundingVotingStrategyImplementation');
        quadraticFundingVotingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, quadraticFundingVotingStrategyArtifact, []);

        // Invoke init
        await quadraticFundingVotingStrategy.init();
      });

      it('invoking init once SHOULD set the round address', async () => {
        expect(await quadraticFundingVotingStrategy.roundAddress()).to.equal(user.address);
      });

      it('invoking init more than once SHOULD revert the transaction ', () => {
        expect(quadraticFundingVotingStrategy.init()).to.revertedWith('init: roundAddress already set')
      });
    });

    describe('test: vote', () => {
      beforeEach(async () => {
        [user] = await ethers.getSigners();

        // Deploy MockERC20 contract
        mockERC20Artifact = await artifacts.readArtifact('MockERC20');
        mockERC20 = <MockERC20>await deployContract(user, mockERC20Artifact, [tokensToBeMinted]);

        // Deploy QuadraticFundingVotingStrategyImplementation contract
        quadraticFundingVotingStrategyArtifact = await artifacts.readArtifact('QuadraticFundingVotingStrategyImplementation');
        quadraticFundingVotingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, quadraticFundingVotingStrategyArtifact, []);

        encodedVotes = [];

        // Prepare Votes
        const votes = [
          [mockERC20.address, grant1TokenTransferAmount, grant1.address],
          [mockERC20.address, grant2TokenTransferAmount, grant2.address],
        ];

        for (let i = 0; i < votes.length; i++) {
          encodedVotes.push(
            ethers.utils.defaultAbiCoder.encode(
              ["address", "uint256", "address"],
              votes[i]
            )
          );
        }

      });

      it("invoking vote when roundAddress is not set SHOULD rever transaction", async ()=> {
        const txn =  quadraticFundingVotingStrategy.vote(encodedVotes, user.address);
        await expect(txn).to.revertedWith('error: voting contract not linked to a round');
      });

      it("invoking vote when sender is not roundAddress SHOULD revert transaction", async ()=> {

        const [_, anotherUser] = await ethers.getSigners();

        // Invoke init
        await quadraticFundingVotingStrategy.connect(anotherUser).init();

        const txn =  quadraticFundingVotingStrategy.vote(encodedVotes, randomAddress);
        await expect(txn).to.revertedWith('error: can be invoked only by round contract');
      });

      it("invoking vote without allowance SHOULD revert transaction ", async() => {
        // Invoke init
        await quadraticFundingVotingStrategy.init();

        const approveTx = await mockERC20.approve(quadraticFundingVotingStrategy.address, 0);
        approveTx.wait();

        const txn =  quadraticFundingVotingStrategy.vote(encodedVotes, user.address);
        await expect(txn).to.revertedWith('ERC20: insufficient allowance');
      });

      it("invoking vote not enough allowance SHOULD revert transaction ", async() => {

        // Invoke init
        await quadraticFundingVotingStrategy.init();

        const approveTx = await mockERC20.approve(quadraticFundingVotingStrategy.address, 100);
        approveTx.wait();

        const txn =  quadraticFundingVotingStrategy.vote(encodedVotes, user.address);
        await expect(txn).to.revertedWith('ERC20: insufficient allowance');

      });

      it("invoking vote SHOULD transfer balance from user to grant", async() => {

        // Invoke init
        await quadraticFundingVotingStrategy.init();

        const beforeVotingUserBalance = await mockERC20.balanceOf(user.address);
        const beforeVotingGrant1Balance = await mockERC20.balanceOf(grant1.address);
        const beforeVotingGrant2Balance = await mockERC20.balanceOf(grant2.address);

        expect(beforeVotingGrant1Balance).to.equal("0");
        expect(beforeVotingGrant2Balance).to.equal("0");

        const approveTx = await mockERC20.approve(quadraticFundingVotingStrategy.address, totalTokenTransfer);
        approveTx.wait();

        const txn = await quadraticFundingVotingStrategy.vote(encodedVotes, user.address);
        txn.wait()

        const afterVotingUserBalance = await mockERC20.balanceOf(user.address);
        const afterVotingGrant1Balance = await mockERC20.balanceOf(grant1.address);
        const afterVotingGrant2Balance = await mockERC20.balanceOf(grant2.address);

        expect(afterVotingUserBalance).to.equal(Number(beforeVotingUserBalance) - totalTokenTransfer);
        expect(afterVotingGrant1Balance).to.equal(grant1TokenTransferAmount);
        expect(afterVotingGrant2Balance).to.equal(grant2TokenTransferAmount);

      });

      it("invoking vote SHOULD emit 2 Vote events", async () => {
        // Invoke init
        await quadraticFundingVotingStrategy.init();

        let votedEvents: Event[] = [];

        const approveTx = await mockERC20.approve(quadraticFundingVotingStrategy.address, totalTokenTransfer);
        approveTx.wait();

        const txn = await quadraticFundingVotingStrategy.vote(encodedVotes, user.address)
        txn.wait();

        // check if vote for first grant fired
        expect(txn).to.emit(quadraticFundingVotingStrategy, 'Voted').withArgs(
          mockERC20.address,
          grant1TokenTransferAmount,
          user.address,
          grant1.address,
          user.address // note: this would be the round contract
        )

        // check if vote for second grant fired
        expect(txn).to.emit(quadraticFundingVotingStrategy, 'Voted').withArgs(
          mockERC20.address,
          grant2TokenTransferAmount,
          user.address,
          grant2.address,
          user.address // note: this would be the round contract
        )

        const receipt = await txn.wait();
        if (receipt.events) {
          votedEvents = receipt.events.filter(e => e.event === 'Voted');
        }

        expect(votedEvents.length).to.equal(2);

      });

    });

  });

});
