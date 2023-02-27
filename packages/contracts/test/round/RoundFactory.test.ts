import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { isAddress } from "ethers/lib/utils";
import { ContractFactory, Wallet } from "ethers";
import { AddressZero } from "@ethersproject/constants";
import { artifacts, ethers, upgrades } from "hardhat";
import { Artifact } from "hardhat/types";
import {
  MerklePayoutStrategyImplementation,
  QuadraticFundingVotingStrategyImplementation,
  RoundFactory,
  RoundImplementation,
} from "../../typechain/";
import { encodeRoundParameters } from "../../scripts/utils";

describe("RoundFactory", function () {

  let user: SignerWithAddress;
  let notOwnerWallet: SignerWithAddress;

  // Round Factory
  let roundFactory: RoundFactory;
  let roundContractFactory: ContractFactory ;

  // Round Implementation
  let roundImplementation: RoundImplementation;
  let roundImplementationArtifact: Artifact;

  // Voting Strategy
  let votingStrategy: QuadraticFundingVotingStrategyImplementation;
  let votingStrategyArtifact: Artifact;

  // Payout Strategy
  let payoutStrategy: MerklePayoutStrategyImplementation;
  let payoutStrategyArtifact: Artifact;

  let protocolTreasury = Wallet.createRandom();


  describe ('constructor', () => {

    it('RoundFactory SHOULD deploy properly', async () => {

      [user] = await ethers.getSigners();

      roundContractFactory = await ethers.getContractFactory('RoundFactory');
      roundFactory = <RoundFactory>await upgrades.deployProxy(roundContractFactory);

      // Verify deploy
      expect(isAddress(roundFactory.address), 'Failed to deploy RoundFactory').to.be.true;
    });
  })


  describe('core functions', () => {

    beforeEach(async () => {
      [user, notOwnerWallet] = await ethers.getSigners();

      // Deploy RoundFactory contract
      roundContractFactory = await ethers.getContractFactory('RoundFactory');
      roundFactory = <RoundFactory>await upgrades.deployProxy(roundContractFactory);

      // Deploy RoundImplementation contract
      roundImplementationArtifact = await artifacts.readArtifact('RoundImplementation');
      roundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

    });

    describe ('test: updateProtocolFeePercentage', async () => {

      it("SHOULD REVERT if not called by owner", async () => {
        const tx = roundFactory.connect(notOwnerWallet).updateProtocolFeePercentage(1);
        await expect(tx).to.revertedWith('Ownable: caller is not the owner');
      });

      it("RoundContract SHOULD have protocolFeePercentage as 0 after deploy ", async () => {
        expect(await roundFactory.protocolFeePercentage()).to.be.equal(0);
      });

      it("RoundContract SHOULD emit ProtocolFeePercentageUpdated event after invoking updateProtocolFeePercentage", async () => {
        await expect(roundFactory.updateProtocolFeePercentage(10))
          .to.emit(roundFactory, 'ProtocolFeePercentageUpdated')
          .withArgs(10);
      });

      it("RoundContract SHOULD persist the new protocolFeePercentage after invoking updateProtocolTreasury", async () => {
        await roundFactory.updateProtocolFeePercentage(20).then(async () => {
          const protocolFeePercentage = await roundFactory.protocolFeePercentage();
          expect(protocolFeePercentage).to.be.equal(20);
        });

      });
    });

    describe ('test: updateProtocolTreasury', async () => {

      it("SHOULD REVERT if not called by owner", async () => {
        const tx = roundFactory.connect(notOwnerWallet).updateProtocolTreasury(protocolTreasury.address);
        await expect(tx).to.revertedWith('Ownable: caller is not the owner');
      });

      it("SHOULD REVERT if protocolTreasure is 0x", async () => {
        const tx = roundFactory.updateProtocolTreasury(AddressZero);
        await expect(tx).to.revertedWith('protocolTreasury is 0x');
      });

      it("RoundContract SHOULD have default protocolTreasury address after deploy ", async () => {
        expect(await roundFactory.protocolTreasury()).to.be.equal(AddressZero);
      });

      it("RoundContract SHOULD emit ProtocolTreasuryUpdated event after invoking updateProtocolTreasury", async () => {
        await expect(roundFactory.updateProtocolTreasury(protocolTreasury.address))
          .to.emit(roundFactory, 'ProtocolTreasuryUpdated')
          .withArgs(protocolTreasury.address);
      });

      it("RoundContract SHOULD have protocolTreasury address after invoking updateProtocolTreasury", async () => {
        await roundFactory.updateProtocolTreasury(protocolTreasury.address).then(async () => {
          const protocolTreasuryAddress = await roundFactory.protocolTreasury();
          expect(protocolTreasuryAddress).to.be.equal(protocolTreasury.address);
        });

      });
    });

    describe ('test: updateRoundContract', async () => {

      it("SHOULD REVERT if not called by owner", async () => {
        const tx = roundFactory.connect(notOwnerWallet).updateRoundContract(roundImplementation.address);
        await expect(tx).to.revertedWith('Ownable: caller is not the owner');
      });

      it("SHOULD REVERT if roundContract is 0x", async () => {
        const tx = roundFactory.updateRoundContract(AddressZero);
        await expect(tx).to.revertedWith('roundContract is 0x');
      });

      it("RoundContract SHOULD have default roundContract after deploy ", async () => {
        expect(await roundFactory.roundContract()).to.be.equal(AddressZero);
      });

      it("RoundContract SHOULD emit RoundContractUpdated event after invoking updateRoundContract", async () => {
        await expect(roundFactory.updateRoundContract(roundImplementation.address))
          .to.emit(roundFactory, 'RoundContractUpdated')
          .withArgs(roundImplementation.address);
      });

      it("RoundContract SHOULD have round address after invoking updateRoundContract", async () => {
        await roundFactory.updateRoundContract(roundImplementation.address).then(async () => {
          const roundContract = await roundFactory.roundContract();
          expect(roundContract).to.be.equal(roundImplementation.address);
        });
      });
    });

    describe ('test: create', async () => {

      const feePercentage = 10;
      const matchAmount = 1000;
      const token = Wallet.createRandom().address;
      const programAddress = Wallet.createRandom().address;
      const roundFeePercentage = 10;
      const roundFeeAddress = Wallet.createRandom().address;

      let _currentBlockTimestamp: number

      let params: any = [];

      beforeEach(async () => {
        [user] = await ethers.getSigners();

        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        // Deploy VotingStrategy contract
        votingStrategyArtifact = await artifacts.readArtifact('QuadraticFundingVotingStrategyImplementation');
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);

        // Deploy PayoutStrategy contract
        payoutStrategyArtifact = await artifacts.readArtifact('MerklePayoutStrategyImplementation');
        payoutStrategy = <MerklePayoutStrategyImplementation>await deployContract(user, payoutStrategyArtifact, []);

        // Deploy RoundFactory contract
        roundContractFactory = await ethers.getContractFactory('RoundFactory');
        roundFactory = <RoundFactory>await upgrades.deployProxy(roundContractFactory);

        // Set the init values
        await roundFactory.updateProtocolTreasury(protocolTreasury.address);
        await roundFactory.updateRoundContract(roundImplementation.address);

        // Creating a Round
        const initAddress = [
          votingStrategy.address, // votingStrategy
          payoutStrategy.address, // payoutStrategy
        ];

        const initRoundTime = [
          _currentBlockTimestamp + 100, // applicationsStartTime
          _currentBlockTimestamp + 250, // applicationsEndTime
          _currentBlockTimestamp + 500, // roundStartTime
          _currentBlockTimestamp + 1000, // roundEndTime
        ];

        const initMetaPtr = [
          { protocol: 1, pointer: "bafybeia4khbew3r2mkflyn7nzlvfzcb3qpfeftz5ivpzfwn77ollj47gqi" }, // roundMetaPtr
          { protocol: 1, pointer: "bafybeiaoakfoxjwi2kwh43djbmomroiryvhv5cetg74fbtzwef7hzzvrnq" }, // applicationMetaPtr
        ];

        const initRoles = [
          [ Wallet.createRandom().address ], // adminRoles
          [ Wallet.createRandom().address, Wallet.createRandom().address ] // roundOperators
        ];

        params = [
          initAddress,
          initRoundTime,
          matchAmount,
          token,
          roundFeePercentage,
          roundFeeAddress,
          initMetaPtr,
          initRoles
        ];

      });

      it("SHOULD REVERT if roundContract is not set", async () => {
        // Deploy RoundFactory contract
        roundContractFactory = await ethers.getContractFactory('RoundFactory');
        roundFactory = <RoundFactory>await upgrades.deployProxy(roundContractFactory);

        const txn = roundFactory.create(
          encodeRoundParameters(params),
          Wallet.createRandom().address, // _ownedBy (Program)
        );

        await expect(txn).to.revertedWith("roundContract is 0x");
      });

      it("SHOULD REVERT if protocolTreasury is not set", async () => {
        // Deploy RoundFactory contract
        let roundContractFactory = await ethers.getContractFactory('RoundFactory');
        let roundFactory = <RoundFactory>await upgrades.deployProxy(roundContractFactory);

        // Set the init values
        await roundFactory.updateRoundContract(roundImplementation.address);

        const txn = roundFactory.create(
          encodeRoundParameters(params),
          programAddress
        );

        await expect(txn).to.revertedWith("protocolTreasury is 0x");
      });

      it("invoking create SHOULD have a successful transaction", async() => {

        const txn = await roundFactory.create(
          encodeRoundParameters(params),
          programAddress
        );

        const receipt = await txn.wait();

        expect(await txn.hash).to.not.be.empty;
        expect(receipt.status).equals(1);
      });

      it("SHOULD emit RoundCreated event after invoking create", async () => {

        const txn = await roundFactory.create(
          encodeRoundParameters(params),
          programAddress
        );

        let roundAddress;
        let roundImplementation;

        const receipt = await txn.wait();
        if (receipt.events) {
          const event = receipt.events.find(e => e.event === 'RoundCreated');
          if (event && event.args) {
            roundAddress = event.args.roundAddress;
            roundImplementation = event.args.roundImplementation;
          }
        }

        expect(txn)
          .to.emit(roundFactory, 'RoundCreated')
          .withArgs(roundAddress, programAddress, roundImplementation);

        expect(isAddress(roundAddress)).to.be.true;
        expect(isAddress(roundImplementation)).to.be.true;

      });

    });

  });

});