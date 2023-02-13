import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract, deployMockContract, MockContract } from "ethereum-waffle";
import { Wallet } from "ethers";
import { isAddress } from "ethers/lib/utils";
import { artifacts, ethers } from "hardhat";
import { Artifact } from "hardhat/types";
import { encodeRoundParameters } from "../../scripts/utils";
import { MerklePayoutStrategyImplementation, QuadraticFundingVotingStrategyImplementation, RoundFactory, RoundImplementation } from "../../typechain";

describe("IPayoutInterface", function () {

  let user: SignerWithAddress;

  // Round Implementation
  let roundImplementation: RoundImplementation;
  let roundImplementationArtifact: Artifact;

  // Voting Strategy
  let votingStrategyContract: QuadraticFundingVotingStrategyImplementation;
  let votingStrategyArtifact: Artifact;

  // MerklePayoutStrategy Implementation
  let merklePayoutStrategy: MerklePayoutStrategyImplementation;
  let merklePayoutStrategyArtifact: Artifact;

  const VERSION = "0.2.0";

  describe('constructor', () => {

    it('SHOULD deploy properly', async () => {

      [user] = await ethers.getSigners();

      // Deploy MerklePayoutStrategyImplementation
      merklePayoutStrategyArtifact = await artifacts.readArtifact('MerklePayoutStrategyImplementation');
      merklePayoutStrategy = <MerklePayoutStrategyImplementation>await deployContract(user, merklePayoutStrategyArtifact, []);

      // Verify deploy
      expect(isAddress(merklePayoutStrategy.address), 'Failed to deploy MerklePayoutStrategyImplementation').to.be.true;
    });
  });

  let _currentBlockTimestamp: number;

  describe('IPayoutInterface functions', () => {

    const initPayoutStrategy = async (
      _currentBlockTimestamp: number,
      payoutStrategyContract: MerklePayoutStrategyImplementation
    ) => {

      const token = Wallet.createRandom().address;

      const roundMetaPtr = { protocol: 1, pointer: "bafybeia4khbew3r2mkflyn7nzlvfzcb3qpfeftz5ivpzfwn77ollj47gqi" };
      const applicationMetaPtr = { protocol: 1, pointer: "bafybeiaoakfoxjwi2kwh43djbmomroiryvhv5cetg74fbtzwef7hzzvrnq" };

      const adminRoles = [ user.address ];
      const roundOperators = [
        user.address,
        Wallet.createRandom().address,
        Wallet.createRandom().address
      ];

      // Deploy RoundImplementation contract
      roundImplementationArtifact = await artifacts.readArtifact('RoundImplementation');
      roundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);
      
      // Deploy voting strategy
      votingStrategyArtifact = await artifacts.readArtifact('QuadraticFundingVotingStrategyImplementation');
      votingStrategyContract = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
      let amount = 100;

      const initAddress = [
        votingStrategyContract.address, // votingStrategy
        payoutStrategyContract.address, // payoutStrategy
      ];

      const initRoundTime = [
        _currentBlockTimestamp + 100, // applicationsStartTime
        _currentBlockTimestamp + 250, // applicationsStartTime
        _currentBlockTimestamp + 500, // roundStartTime
        _currentBlockTimestamp + 1000, // roundEndTime
      ];

      const initMetaPtr = [
        roundMetaPtr,
        applicationMetaPtr,
      ];

      const initRoles = [
        adminRoles,
        roundOperators
      ];

      let params = [
        initAddress,
        initRoundTime,
        amount,
        token,
        initMetaPtr,
        initRoles
      ];

      await roundImplementation.initialize(
        encodeRoundParameters(params),
        Wallet.createRandom().address
      );

    };

    describe('init', () => {

      before(async () => {
        [user] = await ethers.getSigners();

        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        // Deploy MerklePayoutStrategyImplementation
        merklePayoutStrategyArtifact = await artifacts.readArtifact('MerklePayoutStrategyImplementation');
        merklePayoutStrategy = <MerklePayoutStrategyImplementation>await deployContract(user, merklePayoutStrategyArtifact, []);

        await initPayoutStrategy(_currentBlockTimestamp, merklePayoutStrategy);
      });

      it("SHOULD set the contract version", async() => {
        expect(await merklePayoutStrategy.VERSION()).to.equal(VERSION);
      });

      it("SHOULD set the round address", async() => {
        expect(await merklePayoutStrategy.roundAddress()).to.equal(roundImplementation.address);
      });

      it("SHOULD revert WHEN invoked more than once", async() => {
        const tx = merklePayoutStrategy.init();
        await expect(tx).to.revertedWith('roundAddress already set');
      });

      it("SHOULD set default value", async() => {
        expect(await merklePayoutStrategy.isReadyForPayout()).to.equal(false);
        
        const LOCK_DURATION = 5185000; // 60 days
        const endLockingTime = await merklePayoutStrategy.endLockingTime();
        expect(endLockingTime).to.equal(_currentBlockTimestamp + LOCK_DURATION);
      });

    });

    describe('withdrawFunds', () => {

    });
  });
})