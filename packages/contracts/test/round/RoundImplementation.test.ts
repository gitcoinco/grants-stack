import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { BigNumber, BigNumberish, Wallet } from "ethers";
import { BytesLike, formatBytes32String, isAddress } from "ethers/lib/utils";
import { artifacts, ethers, upgrades } from "hardhat";
import { Artifact } from "hardhat/types";
import { encodeRoundParameters } from "../../scripts/utils";
import {
  MockERC20,
  MerklePayoutStrategyImplementation,
  QuadraticFundingVotingStrategyImplementation,
  RoundFactory,
  RoundFactory__factory,
  RoundImplementation,
} from "../../typechain";

type MetaPtr = {
  protocol: BigNumberish;
  pointer: string;
}

describe("RoundImplementation", function () {

  let user: SignerWithAddress;

  // Round Factory
  let roundContractFactory: RoundFactory__factory;
  let roundFactoryContract: RoundFactory;

  // Round Implementation
  let roundImplementation: RoundImplementation;
  let roundImplementationArtifact: Artifact;

  // Voting Strategy
  let votingStrategyContract: QuadraticFundingVotingStrategyImplementation;
  let votingStrategyArtifact: Artifact;

  // Payout Strategy
  let payoutStrategyContract: MerklePayoutStrategyImplementation;
  let payoutStrategyArtifact: Artifact;

  // Variable declarations
  let matchAmount: BigNumberish;
  let token: string;

  let roundFeePercentage: BigNumberish;
  let roundFeeAddress: string;

  let roundMetaPtr: MetaPtr;
  let applicationMetaPtr: MetaPtr;

  let adminRoles: string[];
  let roundOperators: string[];

  const ROUND_OPERATOR_ROLE = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("ROUND_OPERATOR")
  );

  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

  before(async () => {
    [user] = await ethers.getSigners();

    // Deploy RoundFactory contract
    roundContractFactory = await ethers.getContractFactory('RoundFactory');
    roundFactoryContract = <RoundFactory>await upgrades.deployProxy(roundContractFactory);

    // Deploy VotingStrategy contract
    votingStrategyArtifact = await artifacts.readArtifact('QuadraticFundingVotingStrategyImplementation');
    votingStrategyContract = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);

    // Deploy PayoutStrategy contract
    payoutStrategyArtifact = await artifacts.readArtifact('MerklePayoutStrategyImplementation');
    payoutStrategyContract = <MerklePayoutStrategyImplementation>await deployContract(user, payoutStrategyArtifact, []);

  })

  describe('constructor', () => {

    it('deploys properly', async () => {

      roundImplementationArtifact = await artifacts.readArtifact('RoundImplementation');
      roundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

      // Verify deploy
      expect(isAddress(roundImplementation.address), 'Failed to deploy RoundImplementation').to.be.true;
    });
  })


  describe ('core functions', () => {

    const initRound = async (_currentBlockTimestamp: number, overrides ?: any) => {

      // Deploy MockERC20 contract if _token is not provided
      const mockERC20Artifact = await artifacts.readArtifact('MockERC20');
      const tokenContract = <MockERC20>await deployContract(user, mockERC20Artifact, [10000]);
      token =  overrides && overrides.hasOwnProperty('token') ? overrides.token : tokenContract.address;

      // Deploy voting strategy
      votingStrategyContract = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
      // Deploy PayoutStrategy contract
      payoutStrategyContract = <MerklePayoutStrategyImplementation>await deployContract(user, payoutStrategyArtifact, []);

      let matchAmount = overrides && overrides.hasOwnProperty('matchAmount') ? overrides.matchAmount : 100;
      let roundFeePercentage = overrides && overrides.hasOwnProperty('roundFeePercentage') ? overrides.roundFeePercentage : 0;

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
        matchAmount,
        token,
        roundFeePercentage,
        roundFeeAddress,
        initMetaPtr,
        initRoles
      ];

      await roundImplementation.initialize(
        encodeRoundParameters(params),
        roundFactoryContract.address
      );

      return params;
    }

    before(async() => {

      matchAmount = 100;
      token = Wallet.createRandom().address;
      roundFeePercentage = 0;
      roundFeeAddress = Wallet.createRandom().address;

      roundMetaPtr = { protocol: 1, pointer: "bafybeia4khbew3r2mkflyn7nzlvfzcb3qpfeftz5ivpzfwn77ollj47gqi" };
      applicationMetaPtr = { protocol: 1, pointer: "bafybeiaoakfoxjwi2kwh43djbmomroiryvhv5cetg74fbtzwef7hzzvrnq" };

      adminRoles = [ user.address ];
      roundOperators = [
        user.address,
        Wallet.createRandom().address,
        Wallet.createRandom().address
      ];
    })

    beforeEach(async () => {
      // Deploy RoundImplementation contract
      roundImplementationArtifact = await artifacts.readArtifact('RoundImplementation');
      roundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);
    });

    describe ('test: initialize', () => {

      let _currentBlockTimestamp: number;

      beforeEach(async () => {
        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        await initRound(_currentBlockTimestamp);
      });

      it ('default values MUST match the arguments while invoking initialize', async () => {

        // check roles
        expect(await roundImplementation.ROUND_OPERATOR_ROLE()).equals(ROUND_OPERATOR_ROLE);
        expect(await roundImplementation.DEFAULT_ADMIN_ROLE()).equals(DEFAULT_ADMIN_ROLE);

        expect(await roundImplementation.votingStrategy()).equals(votingStrategyContract.address);
        expect(await roundImplementation.payoutStrategy()).equals(payoutStrategyContract.address);

        expect(await roundImplementation.applicationsStartTime()).equals(_currentBlockTimestamp + 100);
        expect(await roundImplementation.applicationsEndTime()).equals(_currentBlockTimestamp + 250);
        expect(await roundImplementation.roundStartTime()).equals(_currentBlockTimestamp + 500);
        expect(await roundImplementation.roundEndTime()).equals(_currentBlockTimestamp + 1000);

        expect(await roundImplementation.matchAmount()).equals(matchAmount);
        expect(await roundImplementation.token()).equals(token);
        expect(await roundImplementation.roundFeePercentage()).equals(0);
        expect(await roundImplementation.roundFeeAddress()).equals(roundFeeAddress);

        const roundMetaPtr = await roundImplementation.roundMetaPtr();
        expect(roundMetaPtr.pointer).equals(roundMetaPtr.pointer);
        expect(roundMetaPtr.protocol).equals(roundMetaPtr.protocol);

        const applicationMetaPtr = await roundImplementation.applicationMetaPtr();
        expect(applicationMetaPtr.pointer).equals(applicationMetaPtr.pointer);
        expect(applicationMetaPtr.protocol).equals(applicationMetaPtr.protocol);

        expect(await roundImplementation.getRoleMemberCount(DEFAULT_ADMIN_ROLE)).equals(adminRoles.length);
        expect(await roundImplementation.getRoleMember(DEFAULT_ADMIN_ROLE, 0)).equals(adminRoles[0]);

        expect(await roundImplementation.getRoleMemberCount(ROUND_OPERATOR_ROLE)).equals(roundOperators.length);
        expect(await roundImplementation.getRoleMember(ROUND_OPERATOR_ROLE, 0)).equals(roundOperators[0]);
        expect(await roundImplementation.getRoleMember(ROUND_OPERATOR_ROLE, 1)).equals(roundOperators[1]);
      });


      it ('SHOULD revert when applicationsStartTime is in the past', async () => {

        // Deploy voting strategy
        votingStrategyContract = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategyContract = <MerklePayoutStrategyImplementation>await deployContract(user, payoutStrategyArtifact, []);

        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        const initAddress = [
          votingStrategyContract.address, // votingStrategy
          payoutStrategyContract.address, // payoutStrategy
        ];

        const initRoundTime = [
          _currentBlockTimestamp - 100, // applicationsStartTime
          _currentBlockTimestamp + 250, // applicationsEndTime
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
          matchAmount,
          token,
          roundFeePercentage,
          roundFeeAddress,
          initMetaPtr,
          initRoles
        ];

        await expect(newRoundImplementation.initialize(
          encodeRoundParameters(params),
          roundFactoryContract.address
        )).to.be.revertedWith("Round: Time has already passed");

      });

      it ('SHOULD revert when applicationsStartTime is after applicationsEndTime', async () => {

        // Deploy voting strategy
        votingStrategyContract = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategyContract = <MerklePayoutStrategyImplementation>await deployContract(user, payoutStrategyArtifact, []);

        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        const initAddress = [
          votingStrategyContract.address, // votingStrategy
          payoutStrategyContract.address, // payoutStrategy
        ];

        const initRoundTime = [
          _currentBlockTimestamp + 100, // applicationsStartTime
          _currentBlockTimestamp + 50, // applicationsEndTime
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
          matchAmount,
          token,
          roundFeePercentage,
          roundFeeAddress,
          initMetaPtr,
          initRoles
        ];

        await expect(newRoundImplementation.initialize(
          encodeRoundParameters(params),
          roundFactoryContract.address
        )).to.be.revertedWith("Round: App end is before app start");

      });

      it ('SHOULD revert if applicationsEndTime is after roundEndTime', async () => {

        // Deploy voting strategy
        votingStrategyContract = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategyContract = <MerklePayoutStrategyImplementation>await deployContract(user, payoutStrategyArtifact, []);

        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        const initAddress = [
          votingStrategyContract.address, // votingStrategy
          payoutStrategyContract.address, // payoutStrategy
        ];

        const initRoundTime = [
          _currentBlockTimestamp + 100, // applicationsStartTime
          _currentBlockTimestamp + 250, // applicationsStartTime
          _currentBlockTimestamp + 500, // roundStartTime
          _currentBlockTimestamp + 200, // roundEndTime
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
          matchAmount,
          token,
          roundFeePercentage,
          roundFeeAddress,
          initMetaPtr,
          initRoles
        ];

        await expect(newRoundImplementation.initialize(
          encodeRoundParameters(params),
          roundFactoryContract.address
        )).to.be.revertedWith("Round: Round end is before app end");

      });

      it ('SHOULD revert if roundEndTime is after roundStartTime', async () => {

        // Deploy voting strategy
        votingStrategyContract = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategyContract = <MerklePayoutStrategyImplementation>await deployContract(user, payoutStrategyArtifact, []);

        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        const initAddress = [
          votingStrategyContract.address, // votingStrategy
          payoutStrategyContract.address, // payoutStrategy
        ];

        const initRoundTime = [
          _currentBlockTimestamp + 100, // applicationsStartTime
          _currentBlockTimestamp + 250, // applicationsStartTime
          _currentBlockTimestamp + 1250, // roundStartTime
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
          matchAmount,
          token,
          roundFeePercentage,
          roundFeeAddress,
          initMetaPtr,
          initRoles
        ];

        await expect(newRoundImplementation.initialize(
          encodeRoundParameters(params),
          roundFactoryContract.address
        )).to.be.revertedWith("Round: Round end is before round start");

      });

      it ('SHOULD revert when applicationsStartTime is after roundStartTime', async () => {

        // Deploy voting strategy
        votingStrategyContract = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategyContract = <MerklePayoutStrategyImplementation>await deployContract(user, payoutStrategyArtifact, []);

        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        const initAddress = [
          votingStrategyContract.address, // votingStrategy
          payoutStrategyContract.address, // payoutStrategy
        ];

        const initRoundTime = [
          _currentBlockTimestamp + 100, // applicationsStartTime
          _currentBlockTimestamp + 250, // applicationsStartTime
          _currentBlockTimestamp + 50, // roundStartTime
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
          matchAmount,
          token,
          roundFeePercentage,
          roundFeeAddress,
          initMetaPtr,
          initRoles
        ];

        await expect(newRoundImplementation.initialize(
          encodeRoundParameters(params),
          roundFactoryContract.address
        )).to.be.revertedWith("Round: Round start is before app start");

      });

      it ('SHOULD revert ON invoking initialize on already initialized contract ', async () => {

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
          matchAmount,
          token,
          roundFeePercentage,
          roundFeeAddress,
          initMetaPtr,
          initRoles
        ];

        await expect(roundImplementation.initialize(
          encodeRoundParameters(params),
          roundFactoryContract.address
        )).to.be.revertedWith("Initializable: contract is already initialized");

      });

    });

    describe ('test: updateMatchAmount', () => {

      let _currentBlockTimestamp: number;

      let newAmount = 100;

      beforeEach(async () => {

        newAmount += 1;

        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        await initRound(_currentBlockTimestamp);
      });

      it ('SHOULD revert if invoked by wallet who is not round operator', async () => {

        const [_, notRoundOperator] = await ethers.getSigners();

        await expect(roundImplementation.connect(notRoundOperator).updateMatchAmount(newAmount)).to.revertedWith(
          `AccessControl: account ${notRoundOperator.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );

      });

      it ('SHOULD update amount value IF called is round operator', async () => {

        const txn = await roundImplementation.updateMatchAmount(newAmount);
        await txn.wait();

        const matchAmount = await roundImplementation.matchAmount();
        expect(matchAmount).equals(newAmount);
      });

      it ('SHOULD emit MatchAmountUpdated event', async () => {

        const txn = await roundImplementation.updateMatchAmount(newAmount);

        expect(txn)
          .to.emit(roundImplementation, 'MatchAmountUpdated')
          .withArgs(
            newAmount
          );
      });

      it ('SHOULD revert if invoked with amount lesser than current amount', async () => {

        const lesserAmount = 2;

        await expect(roundImplementation.updateMatchAmount(lesserAmount)).to.revertedWith(
          `Round: Lesser than current match amount`
        );

      });

      it('SHOULD revert if invoked after roundEndTime', async () => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 1500])

        await expect(
          roundImplementation.updateMatchAmount(newAmount)
        ).to.revertedWith("Round: Round has ended");
      });
    });

    describe ('test: updateRoundFeePercentage', () => {

      let _currentBlockTimestamp: number;

      beforeEach(async () => {
        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        await initRound(_currentBlockTimestamp);
      });

      it ('SHOULD revert if invoked by wallet who is not round operator', async () => {
        const newRoundFeePercentage = 10;
        const [_, notRoundOperator] = await ethers.getSigners();
        await expect(roundImplementation.connect(notRoundOperator).updateRoundFeePercentage(newRoundFeePercentage)).to.revertedWith(
          `AccessControl: account ${notRoundOperator.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );

      });

      it ('SHOULD update roundFeePercentage value IF called is round operator', async () => {

        const newRoundFeePercentage = 10;

        const txn = await roundImplementation.updateRoundFeePercentage(newRoundFeePercentage);
        await txn.wait();

        const roundFeePercentage = await roundImplementation.roundFeePercentage();
        expect(roundFeePercentage).equals(newRoundFeePercentage);
      });

      it ('SHOULD emit RoundFeePercentageUpdated event', async () => {

        const newRoundFeePercentage = 10;

        const txn = await roundImplementation.updateRoundFeePercentage(newRoundFeePercentage);

        expect(txn)
          .to.emit(roundImplementation, 'RoundFeePercentageUpdated')
          .withArgs(newRoundFeePercentage);
      });

      it('SHOULD revert if invoked after roundEndTime', async () => {

        const newRoundFeePercentage = 10;

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 1500])

        await expect(
          roundImplementation.updateRoundFeePercentage(newRoundFeePercentage)
        ).to.revertedWith("Round: Round has ended");
      });
    });

    describe ('test: updateRoundFeeAddress', () => {

      let _currentBlockTimestamp: number;

      beforeEach(async () => {
        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        await initRound(_currentBlockTimestamp);
      });

      it ('SHOULD revert if invoked by wallet who is not round operator', async () => {
        const newRoundFeeAddress = Wallet.createRandom().address;
        const [_, notRoundOperator] = await ethers.getSigners();
        await expect(roundImplementation.connect(notRoundOperator).updateRoundFeeAddress(newRoundFeeAddress)).to.revertedWith(
          `AccessControl: account ${notRoundOperator.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );

      });

      it ('SHOULD update roundFeeAddress IF called is round operator', async () => {

        const newRoundFeeAddress = Wallet.createRandom().address;

        const txn = await roundImplementation.updateRoundFeeAddress(newRoundFeeAddress);
        await txn.wait();

        const roundFeeAddress = await roundImplementation.roundFeeAddress();
        expect(roundFeeAddress).equals(newRoundFeeAddress);
      });

      it ('SHOULD emit RoundFeeAddressUpdated event', async () => {

        const newRoundFeeAddress = Wallet.createRandom().address;

        const txn = await roundImplementation.updateRoundFeeAddress(newRoundFeeAddress);

        expect(txn)
          .to.emit(roundImplementation, 'RoundFeeAddressUpdated')
          .withArgs(newRoundFeeAddress);
      });

      it('SHOULD revert if invoked after roundEndTime', async () => {

        const newRoundFeeAddress = Wallet.createRandom().address;

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 1500])

        await expect(
          roundImplementation.updateRoundFeeAddress(newRoundFeeAddress)
        ).to.revertedWith("Round: Round has ended");
      });
    });

    describe ('test: updateRoundMetaPtr', () => {

      let _currentBlockTimestamp: number;

      const randomMetaPtr: MetaPtr = {
        protocol: 1,
        pointer: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
      };

      beforeEach(async () => {
        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        await initRound(_currentBlockTimestamp);
      });

      it ('SHOULD revert if invoked by wallet who is not round operator', async () => {
        const [_, notRoundOperator] = await ethers.getSigners();
        await expect(roundImplementation.connect(notRoundOperator).updateRoundMetaPtr(randomMetaPtr)).to.revertedWith(
          `AccessControl: account ${notRoundOperator.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );

      });

      it ('SHOULD update roundMetaPtr value IF called is round operator', async () => {

        const txn = await roundImplementation.updateRoundMetaPtr(randomMetaPtr);
        await txn.wait();

        const roundMetaPtr = await roundImplementation.roundMetaPtr();
        expect(roundMetaPtr.pointer).equals(randomMetaPtr.pointer);
        expect(roundMetaPtr.protocol).equals(randomMetaPtr.protocol);
      });

      it ('SHOULD emit RoundMetaPtrUpdated event', async () => {

        const txn = await roundImplementation.updateRoundMetaPtr(randomMetaPtr);

        expect(txn)
          .to.emit(roundImplementation, 'RoundMetaPtrUpdated')
          .withArgs(
            [ roundMetaPtr.protocol, roundMetaPtr.pointer ],
            [ randomMetaPtr.protocol, randomMetaPtr.pointer ]
          );
      });

      it('SHOULD revert if invoked after roundEndTime', async () => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 1500])

        await expect(
          roundImplementation.updateRoundMetaPtr(randomMetaPtr)
        ).to.revertedWith("Round: Round has ended");
      });
    });

    describe ('test: updateApplicationMetaPtr', () => {

      let _currentBlockTimestamp: number;

      const randomMetaPtr: MetaPtr = {
        protocol: 1,
        pointer: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
      };

      beforeEach(async () => {
        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        await initRound(_currentBlockTimestamp);
      });

      it ('updateApplicationMetaPtr SHOULD revert if invoked by wallet who is not round operator', async () => {
        const [_, notRoundOperator] = await ethers.getSigners();

        await expect(roundImplementation.connect(notRoundOperator).updateApplicationMetaPtr(randomMetaPtr)).to.revertedWith(
          `AccessControl: account ${notRoundOperator.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );

      });

      it ('SHOULD update applicationMetaPtr value IF called is round operator', async () => {
        const txn = await roundImplementation.updateApplicationMetaPtr(randomMetaPtr);
        await txn.wait();

        const applicationMetaPtr = await roundImplementation.applicationMetaPtr();
        expect(applicationMetaPtr.pointer).equals(randomMetaPtr.pointer);
        expect(applicationMetaPtr.protocol).equals(randomMetaPtr.protocol);
      });

      it ('SHOULD emit ApplicationMetaPtrUpdated event', async () => {

        const txn = await roundImplementation.updateApplicationMetaPtr(randomMetaPtr);

        expect(txn)
          .to.emit(roundImplementation, 'ApplicationMetaPtrUpdated')
          .withArgs(
            [ applicationMetaPtr.protocol, applicationMetaPtr.pointer ],
            [ randomMetaPtr.protocol, randomMetaPtr.pointer ]
          );
      });

      it('SHOULD revert if invoked after roundEndTime', async () => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 150000])

        await expect(
          roundImplementation.updateApplicationMetaPtr(randomMetaPtr)
        ).to.revertedWith("Round: Round has ended");
      });
    });

    describe ('test: updateStartAndEndTimes', () => {

      let _currentBlockTimestamp: number;
      let newApplicationsStartTime: number;
      let newApplicationsEndTime: number;
      let newRoundStartTime: number;
      let newRoundEndTime: number;

      beforeEach(async () => {

        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        newApplicationsStartTime = _currentBlockTimestamp + 150;
        newApplicationsEndTime = _currentBlockTimestamp + 350;
        newRoundStartTime = _currentBlockTimestamp + 550;
        newRoundEndTime = _currentBlockTimestamp + 750;

        await initRound(_currentBlockTimestamp);
      });

      it ('SHOULD revert if invoked by wallet who is not round operator', async () => {
        const [_, notRoundOperator] = await ethers.getSigners();
        await expect(roundImplementation.connect(notRoundOperator).updateStartAndEndTimes(
          newApplicationsStartTime,
          newApplicationsEndTime,
          newRoundStartTime,
          newRoundEndTime
        )).to.revertedWith(
          `AccessControl: account ${notRoundOperator.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );
      });

      it ('SHOULD revert if newApplicationStartTime is after newApplicationsEndTime', async () => {

        const _newApplicationsStartTime = _currentBlockTimestamp + 400;

        await expect(roundImplementation.updateStartAndEndTimes(
          _newApplicationsStartTime,
          newApplicationsEndTime,
          newRoundStartTime,
          newRoundEndTime
        )).to.revertedWith(
          'Round: Application end is before application start'
        );
      });

      it ('SHOULD revert if newRoundStartTime is after newRoundEndTime', async () => {

        const _newRoundStartTime = _currentBlockTimestamp + 800;

        await expect(roundImplementation.updateStartAndEndTimes(
          newApplicationsStartTime,
          newApplicationsEndTime,
          _newRoundStartTime,
          newRoundEndTime
        )).to.revertedWith(
          'Round: Round end is before round start'
        );
      });

      it ('SHOULD revert if newRoundStartTime is before newApplicationsStartTime', async () => {

        const _newApplicationsStartTime = _currentBlockTimestamp + 600;
        const _newApplicationsEndTime = _currentBlockTimestamp + 800;

        await expect(roundImplementation.updateStartAndEndTimes(
          _newApplicationsStartTime,
          _newApplicationsEndTime,
          newRoundStartTime,
          newRoundEndTime
        )).to.revertedWith(
          'Round: Round start is before application start'
        );
      });

      it ('SHOULD revert if newApplicationsEndTime is after newRoundEndTime', async () => {

       const _newApplicationsEndTime = _currentBlockTimestamp + 800;

        await expect(roundImplementation.updateStartAndEndTimes(
          newApplicationsStartTime,
          _newApplicationsEndTime,
          newRoundStartTime,
          newRoundEndTime
        )).to.revertedWith(
          'Round: Round end is before application end'
        );
      });

      it('SHOULD update start & end times value IF called is round operator', async () => {

        const txn = await roundImplementation.updateStartAndEndTimes(
          newApplicationsStartTime,
          newApplicationsEndTime,
          newRoundStartTime,
          newRoundEndTime
        );
        await txn.wait();

        const applicationsStartTime = await roundImplementation.applicationsStartTime();
        const applicationsEndTime = await roundImplementation.applicationsEndTime();
        const roundStartTime = await roundImplementation.roundStartTime();
        const roundEndTime = await roundImplementation.roundEndTime();

        expect(applicationsStartTime).equals(newApplicationsStartTime);
        expect(applicationsEndTime).equals(newApplicationsEndTime);
        expect(roundStartTime).equals(newRoundStartTime);
        expect(roundEndTime).equals(newRoundEndTime);

      });

      it('SHOULD emit all TimeUpdated event', async() => {

        const oldApplicationStartTime = await roundImplementation.applicationsStartTime();
        const oldApplicationEndTime = await roundImplementation.applicationsEndTime();
        const oldRoundStartTime = await roundImplementation.roundStartTime();
        const oldRoundEndTime = await roundImplementation.roundEndTime();

        const tx = await roundImplementation.updateStartAndEndTimes(
          newApplicationsStartTime,
          newApplicationsEndTime,
          newRoundStartTime,
          newRoundEndTime
        );

        expect(tx)
          .to.emit(roundImplementation, 'ApplicationsStartTimeUpdated')
          .withArgs(oldApplicationStartTime, newApplicationsStartTime);

        expect(tx)
          .to.emit(roundImplementation, 'ApplicationsEndTimeUpdated')
          .withArgs(oldApplicationEndTime, newApplicationsEndTime);

        expect(tx)
          .to.emit(roundImplementation, 'RoundStartTimeUpdated')
          .withArgs(oldRoundStartTime, newRoundStartTime);

        expect(tx)
          .to.emit(roundImplementation, 'RoundEndTimeUpdated')
          .withArgs(oldRoundEndTime, newRoundEndTime);
      });

      it('SHOULD revert if newApplicationsStartTime has passed current timestamp', async() => {

        const _newApplicationsStartTime = _currentBlockTimestamp - 100;

        const tx = roundImplementation.updateStartAndEndTimes(
          _newApplicationsStartTime,
          newApplicationsEndTime,
          newRoundStartTime,
          newRoundEndTime
        )

        await expect(tx).to.revertedWith("Round: Time has already passed");

      });

      it('SHOULD emit event only for updated timestamp', async() => {

        const oldApplicationStartTime = await roundImplementation.applicationsStartTime();
        const oldApplicationEndTime = await roundImplementation.applicationsEndTime();
        const oldRoundStartTime = await roundImplementation.roundStartTime();
        const oldRoundEndTime = await roundImplementation.roundEndTime();

        const tx = await roundImplementation.updateStartAndEndTimes(
          newApplicationsStartTime,
          newApplicationsEndTime,
          newRoundStartTime,
          oldRoundEndTime
        );

        expect(tx)
          .to.emit(roundImplementation, 'ApplicationsStartTimeUpdated')
          .withArgs(oldApplicationStartTime, newApplicationsStartTime);

        expect(tx)
          .to.emit(roundImplementation, 'ApplicationsEndTimeUpdated')
          .withArgs(oldApplicationEndTime, newApplicationsEndTime);

        expect(tx)
          .to.emit(roundImplementation, 'RoundStartTimeUpdated')
          .withArgs(oldRoundStartTime, newRoundStartTime);

        expect(tx)
          .not.to.emit(roundImplementation, 'RoundEndTimeUpdated');
      });

      it('SHOULD revert if invoked after roundEndTime', async () => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 1500])

        await expect(
          roundImplementation.updateStartAndEndTimes(
            newApplicationsStartTime,
            newApplicationsEndTime,
            newRoundStartTime,
            newRoundEndTime
          )
        ).to.revertedWith("Round: Round has ended");
      });

    });

    describe('test: updateProjectsMetaPtr', () => {

      let _currentBlockTimestamp: number;

      const defaultPointer = { protocol: 0, pointer: "" };
      const randomMetaPtr: MetaPtr = {
        protocol: 1,
        pointer: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
      };

      beforeEach(async() => {

        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        await initRound(_currentBlockTimestamp);

      });

      it('updateProjectsMetaPtr SHOULD revert if invoked by wallet who is not round operator', async () => {

        const [_, notRoundOperator] = await ethers.getSigners();

        await expect(roundImplementation.connect(notRoundOperator).updateProjectsMetaPtr(randomMetaPtr)).to.revertedWith(
          `AccessControl: account ${notRoundOperator.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );

      });

      it('SHOULD update roundMetaPtr value IF caller is round operator', async () => {

        const txn = await roundImplementation.updateProjectsMetaPtr(randomMetaPtr);
        await txn.wait();

        const projectsMetaPtr = await roundImplementation.projectsMetaPtr();
        expect(projectsMetaPtr.pointer).equals(randomMetaPtr.pointer);
        expect(projectsMetaPtr.protocol).equals(randomMetaPtr.protocol);
      });

      it('SHOULD emit ProjectsMetaPtrUpdated event', async () => {

        const txn = await roundImplementation.updateProjectsMetaPtr(randomMetaPtr);

        expect(txn)
          .to.emit(roundImplementation, 'ProjectsMetaPtrUpdated')
          .withArgs(
            [ defaultPointer.protocol,  defaultPointer.pointer ],
            [ randomMetaPtr.protocol, randomMetaPtr.pointer ]
          );
      });

      it('SHOULD revert if invoked after roundEndTime', async () => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 1500])

        await expect(roundImplementation.updateProjectsMetaPtr(randomMetaPtr)).to.revertedWith("Round: Round has ended");
      });

    });

    describe ('test: applyToRound', () => {

      let projectID: string;
      let newProjectMetaPtr: MetaPtr;
      let _currentBlockTimestamp: number;

      before(async() => {

        projectID = ethers.utils.hexlify(ethers.utils.randomBytes(32));

        newProjectMetaPtr = {
          protocol: 1,
          pointer: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
        };
      });

      beforeEach(async() => {

        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        await initRound(_currentBlockTimestamp);

      });

      it('SHOULD revert WHEN invoked before applicationsStartTime has started', async () => {
        await expect(roundImplementation.applyToRound(projectID, newProjectMetaPtr)).to.be.revertedWith(
          "Round: Applications period over"
        );
      });

      it('SHOULD revert WHEN invoked after applicationsEndTime', async () => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 7500])

        await expect(roundImplementation.applyToRound(projectID, newProjectMetaPtr)).to.be.revertedWith(
          "Round: Applications period over"
        );
      });

      it('SHOULD emit NewProjectApplication event', async() => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 110])

        const txn = await roundImplementation.applyToRound(projectID, newProjectMetaPtr);

        expect(txn).to.emit(
          roundImplementation, 'NewProjectApplication'
        ).withArgs(
          projectID,
          [ newProjectMetaPtr.protocol, newProjectMetaPtr.pointer ]
        );
      });
    });

    describe ('test: vote', () => {

      let encodedVotes: BytesLike[] = [];
      let mockERC20 : MockERC20;
      let _currentBlockTimestamp: number;

      beforeEach(async () => {
        let mockERC20Artifact = await artifacts.readArtifact('MockERC20');
        mockERC20 = <MockERC20>await deployContract(user, mockERC20Artifact, [10000]);

        // Prepare Votes
        const votes = [
          [mockERC20.address, 5,  Wallet.createRandom().address, formatBytes32String("grant2")]
        ];

        for (let i = 0; i < votes.length; i++) {
          encodedVotes.push(ethers.utils.defaultAbiCoder.encode(
            ["address", "uint256", "address", "bytes32"],
            votes[i]
          ));
        }

        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        await initRound(_currentBlockTimestamp);
      });

      it('SHOULD NOT revert when round is active', async () => {

        await mockERC20.approve(votingStrategyContract.address, 1000);

        // Mine Blocks
        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 900])

        await expect(roundImplementation.vote(encodedVotes)).to.not.be.reverted;
      })

      it('SHOULD revert WHEN invoked before roundStartTime', async () => {
        await expect(roundImplementation.vote(encodedVotes)).to.be.revertedWith(
          "Round: Round is not active"
        );
      });

      it('SHOULD revert WHEN invoked after roundEndTime', async () => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 18000])

        await expect(roundImplementation.vote(encodedVotes)).to.be.revertedWith(
          "Round: Round is not active"
        );
      });

      it('SHOULD revert when invoked without Allowance', async () => {
        // Mine Blocks
        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 600])

        await expect(roundImplementation.vote(encodedVotes)).to.be.revertedWith(
          "ERC20: insufficient allowance"
        );
      });

    });

    describe ('test: setReadyForPayout', () => {
      let mockERC20 : MockERC20;
      let _currentBlockTimestamp: number;

      beforeEach(async () => {

        // Deploy RoundImplementation contract
        roundImplementationArtifact = await artifacts.readArtifact('RoundImplementation');
        roundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        let mockERC20Artifact = await artifacts.readArtifact('MockERC20');
        mockERC20 = <MockERC20>await deployContract(user, mockERC20Artifact, [10000]);

        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        await initRound(_currentBlockTimestamp, mockERC20.address);
      });

      it('SHOULD revert when round has ended', async () => {
        await expect(
          roundImplementation.setReadyForPayout()
        ).to.revertedWith("Round: Round has not ended");
      });

      it('SHOULD revert when called is not round operator', async () => {
        const [ _, notRoundOperator ] = await ethers.getSigners();
        // Mine Blocks
        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 1200])

        await expect(
          roundImplementation.connect(notRoundOperator).setReadyForPayout()
        ).to.revertedWith(
          `AccessControl: account ${notRoundOperator.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );
      });

      it('SHOULD revert when round contract does not have enough funds', async () => {
        // Mine Blocks
        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 1200])

        await expect(
          roundImplementation.setReadyForPayout()
        ).to.revertedWith("Round: Not enough funds in contract");
      });
    });

    describe('test: setReadyForPayout', () => {

      let protocolTreasuryBalance: BigNumber;
      let protocolTreasury: string;
      let feePercentage = 10;

      before(async() => {
        protocolTreasury = Wallet.createRandom().address;

        roundFactoryContract.updateProtocolTreasury(protocolTreasury);
        roundFactoryContract.updateProtocolFeePercentage(feePercentage);
      })


      describe('Native token payout', () => {

        let _currentBlockTimestamp: number;
        let roundMatchAmount = ethers.utils.parseEther("10");
        let protocolFeePercentage: any;
        let roundParams: any;
        let tx: any;

        beforeEach(async () => {
          // update protocol treasury
          protocolTreasury = Wallet.createRandom().address;
          await roundFactoryContract.updateProtocolTreasury(protocolTreasury);

          // get protocol fee percentage
          protocolFeePercentage = await roundFactoryContract.protocolFeePercentage();

          // Deploy RoundImplementation contract
          roundImplementationArtifact = await artifacts.readArtifact('RoundImplementation');
          roundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

          _currentBlockTimestamp = (await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber())
          ).timestamp;

          roundParams = await initRound(_currentBlockTimestamp, {
            token: ethers.constants.AddressZero,
            matchAmount: roundMatchAmount,
            roundFeePercentage: 10,
          });

          // Mine Blocks
          await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 1200])

          // check round balance
          let originalRoundBalance = await ethers.provider.getBalance(roundImplementation.address);
          expect(originalRoundBalance).to.equal(ethers.utils.parseEther("0"));

          // check protocolTreasury balance
          protocolTreasuryBalance = await ethers.provider.getBalance(protocolTreasury);

          // check round fee address balance
          let roundFeeAddress = await roundImplementation.roundFeeAddress();
          let roundFeeAddressBalance = await ethers.provider.getBalance(roundFeeAddress);


          // send funds to contract
          await user.sendTransaction({
            to: roundImplementation.address,
            value: ethers.utils.parseEther("10"),
          });

          // send fee funds to contract
          await user.sendTransaction({
            to: roundImplementation.address,
            value: ethers.utils.parseEther("2"),
          });

          let payoutContract = await roundImplementation.payoutStrategy();
          let payoutContractBalance = await ethers.provider.getBalance(payoutContract);
          expect(Number(payoutContractBalance)).to.be.equal(0);

          tx = await roundImplementation.setReadyForPayout();
        });

        it("SHOULD emit PayFeeAndEscrowFundsToPayoutContract and transfer fee to protocol treasury & roundFeeAddress", async () => {

          let newProtocolTreasuryBalance = await ethers.provider.getBalance(protocolTreasury);
          let payoutContract = await roundImplementation.payoutStrategy();
          let roundFeeAddress = await roundImplementation.roundFeeAddress();
          let payoutContractBalance = await ethers.provider.getBalance(payoutContract);
          let newRoundFeeAddressBalance = await ethers.provider.getBalance(roundFeeAddress);

          expect(tx).to.emit(
            roundImplementation,
            'PayFeeAndEscrowFundsToPayoutContract'
          ).withArgs(
            payoutContractBalance,
            newProtocolTreasuryBalance,
            newRoundFeeAddressBalance
          );

          expect(newProtocolTreasuryBalance).to.be.equal(
            ethers.utils.parseEther("1")
          );

          expect(newRoundFeeAddressBalance).to.be.equal(
            ethers.utils.parseEther("1")
          );
        });

        it("SHOULD transfer pot amount to payout contract", async () => {
          let payoutContract = await roundImplementation.payoutStrategy();
          let payoutContractBalance = await ethers.provider.getBalance(payoutContract);

          expect(Number(payoutContractBalance)).to.be.greaterThan(0);
        });


        it("Funds in round contract SHOULD be 0 after payout", async () => {
          let roundBalance = await ethers.provider.getBalance(roundImplementation.address);
          expect(roundBalance).to.equal(ethers.utils.parseEther("0"));
        });

      });


      describe('ERC20 payout - Protocol Fee', () => {

        let originalUserBalance: Number;
        let _currentBlockTimestamp;
        let mockERC20 : MockERC20;
        let params: any;
        let tx: any;

        beforeEach(async () => {

          // update protocol treasury
          protocolTreasury = Wallet.createRandom().address;
          await roundFactoryContract.updateProtocolTreasury(protocolTreasury);

          // Deploy RoundImplementation contract
          roundImplementationArtifact = await artifacts.readArtifact('RoundImplementation');
          roundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

          let mockERC20Artifact = await artifacts.readArtifact('MockERC20');
          mockERC20 = <MockERC20>await deployContract(user, mockERC20Artifact, [10000]);

          _currentBlockTimestamp = (await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber())
          ).timestamp;

          params = await initRound(_currentBlockTimestamp, {
            matchAmount: 100,
            token: mockERC20.address
          });

          // check user balance before sending funds
          originalUserBalance = Number(await mockERC20.balanceOf(user.address));

          // send funds to contract
          await mockERC20.transfer(roundImplementation.address, 110);

          // check round balance
          const roundBalance = Number(await mockERC20.balanceOf(roundImplementation.address));
          expect(roundBalance).to.equal(110);

          // Mine Blocks
          await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 1200])

          // invoke setReadyForPayout
          tx = await roundImplementation.setReadyForPayout();

        });

        it("SHOULD emit PayFeeAndEscrowFundsToPayoutContract", async () => {
          expect(tx).to.emit(
            roundImplementation,
            'PayFeeAndEscrowFundsToPayoutContract'
          ).withArgs(100, 10, 0);
        });

        it("SHOULD transfer fee to protocolTreasury", async () => {
          expect(Number(await mockERC20.balanceOf(protocolTreasury))).to.equal(10);
        });

        it("SHOULD transfer pot amount to payout contract", async () => {
          const payoutContractAddress = await roundImplementation.payoutStrategy();
          expect(Number(await mockERC20.balanceOf(payoutContractAddress))).to.equal(100);
        });

        it("Funds in round contract SHOULD always be 0 after payout", async () => {
          expect(await mockERC20.balanceOf(roundImplementation.address)).to.equal(0);
        });
      });

      describe('ERC20 payout - Round Fee', () => {

        let originalUserBalance: Number;
        let _currentBlockTimestamp;
        let mockERC20 : MockERC20;
        let params: any;
        let tx: any;

        beforeEach(async () => {

          // update protocol treasury
          protocolTreasury = Wallet.createRandom().address;
          await roundFactoryContract.updateProtocolTreasury(protocolTreasury);
          await roundFactoryContract.updateProtocolFeePercentage(0);

          // Deploy RoundImplementation contract
          roundImplementationArtifact = await artifacts.readArtifact('RoundImplementation');
          roundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

          let mockERC20Artifact = await artifacts.readArtifact('MockERC20');
          mockERC20 = <MockERC20>await deployContract(user, mockERC20Artifact, [10000]);

          _currentBlockTimestamp = (await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber())
          ).timestamp;

          params = await initRound(_currentBlockTimestamp, {
            matchAmount: 100,
            token: mockERC20.address,
            roundFeePercentage: 10
          });

          // check user balance before sending funds
          originalUserBalance = Number(await mockERC20.balanceOf(user.address));

          // send funds to contract
          await mockERC20.transfer(roundImplementation.address, 110);

          // check round balance
          const roundBalance = Number(await mockERC20.balanceOf(roundImplementation.address));
          expect(roundBalance).to.equal(110);

          // Mine Blocks
          await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 1200])

          // invoke setReadyForPayout
          tx = await roundImplementation.setReadyForPayout();
        });

        it("SHOULD emit PayFeeAndEscrowFundsToPayoutContract", async () => {
          let roundFeeAddress = await roundImplementation.roundFeeAddress();

          expect(tx).to.emit(
            roundImplementation,
            'PayFeeAndEscrowFundsToPayoutContract'
          ).withArgs(100, 0, 10);
        });

        it("SHOULD NOT transfer fee to protocolTreasury", async () => {
          expect(Number(await mockERC20.balanceOf(protocolTreasury))).to.equal(0);
        });

        it("SHOULD NOT transfer fee to roundFeeAddress", async () => {
          let roundFeeAddress = await roundImplementation.roundFeeAddress();

          expect(Number(await mockERC20.balanceOf(roundFeeAddress))).to.equal(10);
        });


        it("SHOULD transfer pot amount to payout contract", async () => {
          const payoutContractAddress = await roundImplementation.payoutStrategy();
          expect(Number(await mockERC20.balanceOf(payoutContractAddress))).to.equal(100);
        });

        it("Funds in round contract SHOULD always be 0 after payout", async () => {
          expect(await mockERC20.balanceOf(roundImplementation.address)).to.equal(0);
        });
      });

      describe('ERC20 payout No Fee', () => {

        let originalUserBalance: Number;
        let _currentBlockTimestamp;
        let mockERC20 : MockERC20;
        let params: any;
        let tx: any;

        beforeEach(async () => {

          // update protocol treasury
          protocolTreasury = Wallet.createRandom().address;
          await roundFactoryContract.updateProtocolTreasury(protocolTreasury);
          await roundFactoryContract.updateProtocolFeePercentage(0);

          // Deploy RoundImplementation contract
          roundImplementationArtifact = await artifacts.readArtifact('RoundImplementation');
          roundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

          let mockERC20Artifact = await artifacts.readArtifact('MockERC20');
          mockERC20 = <MockERC20>await deployContract(user, mockERC20Artifact, [10000]);

          _currentBlockTimestamp = (await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber())
          ).timestamp;

          params = await initRound(_currentBlockTimestamp, {
            matchAmount: 100,
            token: mockERC20.address
          });

          // check user balance before sending funds
          originalUserBalance = Number(await mockERC20.balanceOf(user.address));

          // send funds to contract
          await mockERC20.transfer(roundImplementation.address, 100);

          // check round balance
          const roundBalance = Number(await mockERC20.balanceOf(roundImplementation.address));
          expect(roundBalance).to.equal(100);

          // Mine Blocks
          await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 1200])

          // invoke setReadyForPayout
          tx = await roundImplementation.setReadyForPayout();
        });

        it("SHOULD emit PayFeeAndEscrowFundsToPayoutContract", async () => {
          expect(tx).to.emit(
            roundImplementation,
            'PayFeeAndEscrowFundsToPayoutContract'
          ).withArgs(100, 0, 0);
        });

        it("SHOULD NOT transfer fee to protocolTreasury", async () => {
          expect(Number(await mockERC20.balanceOf(protocolTreasury))).to.equal(0);
        });

        it("SHOULD transfer pot amount to payout contract", async () => {
          const payoutContractAddress = await roundImplementation.payoutStrategy();
          expect(Number(await mockERC20.balanceOf(payoutContractAddress))).to.equal(100);
        });

        it("Funds in round contract SHOULD always be 0 after payout", async () => {
          expect(await mockERC20.balanceOf(roundImplementation.address)).to.equal(0);
        });
      });
    });

    describe('test: withdraw', () => {

      let mockERC20: MockERC20;
      let _currentBlockTimestamp: number;

      beforeEach(async () => {
        // Deploy RoundImplementation contract
        roundImplementationArtifact = await artifacts.readArtifact('RoundImplementation');
        roundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        let mockERC20Artifact = await artifacts.readArtifact('MockERC20');
        mockERC20 = <MockERC20>await deployContract(user, mockERC20Artifact, [10000]);

        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        await initRound(_currentBlockTimestamp);
      });

      it("SHOULD revert when not invoked by round operator", async () => {
        const [ user , notRoundOperator ] = await ethers.getSigners();

        await expect(
          roundImplementation.connect(notRoundOperator).withdraw(mockERC20.address, user.address)
        ).to.revertedWith(
          `AccessControl: account ${notRoundOperator.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );

      });

      it("SHOULD revert when trying to withdraw round token", async () => {
        const roundToken = await roundImplementation.token();

        await expect(
          roundImplementation.withdraw(roundToken, user.address)
        ).to.revertedWith(
          `Round: Cannot withdraw round token`
        );
      });

      it("SHOULD drain and transfer ERC-20 token funds from contract to recipent ", async () => {

        // check user balance before withdraw
        let originalUserBalance = Number(await mockERC20.balanceOf(user.address));

        // transfer tokens to 1000 to round contract
        await mockERC20.transfer(roundImplementation.address, 100);

        let userBalanceBeforeWithdraw = Number(await mockERC20.balanceOf(user.address));
        expect(userBalanceBeforeWithdraw).to.equal(originalUserBalance - 100);

        // check round balance before withdraw
        let roundBalance = await mockERC20.balanceOf(roundImplementation.address);
        expect(roundBalance).to.equal(100);

        // withdraw
        await roundImplementation.withdraw(mockERC20.address, user.address);

        // check user balance after withdraw
        let userBalanceAfterWithdraw = Number(await mockERC20.balanceOf(user.address));
        expect(userBalanceAfterWithdraw).to.equal(originalUserBalance);

        // check round balance after withdraw
        let roundBalanceAfterWithdraw = Number(await mockERC20.balanceOf(roundImplementation.address))
        expect(roundBalanceAfterWithdraw).to.equal(0);
      });

      it("SHOULD drain and transfer native token funds from contract to recipent ", async () => {

        // transfer tokens to 1 ETH to round contract
        await user.sendTransaction({
          to: roundImplementation.address,
          value: ethers.utils.parseEther("1.0"),
        });

        // check round balance before withdraw
        let roundBalance = await ethers.provider.getBalance(roundImplementation.address);
        expect(roundBalance).to.equal(ethers.utils.parseEther("1.0"));

        await roundImplementation.withdraw(ethers.constants.AddressZero, user.address);

        // check round balance after withdraw
        roundBalance = await ethers.provider.getBalance(roundImplementation.address);
        expect(roundBalance).to.equal(ethers.utils.parseEther("0"));

      });

    });

  })

});
