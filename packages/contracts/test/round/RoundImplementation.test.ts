import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { BigNumberish, Wallet } from "ethers";
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

  // Round Implementation
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
  let amount: BigNumberish;
  let token: string;

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


  describe('core functions', () => {

    const initRound = async (_currentBlockTimestamp: number) => {

      // Deploy voting strategy
      votingStrategyContract = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
      // Deploy PayoutStrategy contract
      payoutStrategyContract = <MerklePayoutStrategyImplementation>await deployContract(user, payoutStrategyArtifact, []);

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
        roundFactoryContract.address
      );

    }

    before(async() => {

      amount = 100;
      token = Wallet.createRandom().address;

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

    describe('test: initialize', () => {

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

        expect(await roundImplementation.amount()).equals(amount);
        expect(await roundImplementation.token()).equals(token);

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
          amount,
          token,
          initMetaPtr,
          initRoles
        ];

        await expect(newRoundImplementation.initialize(
          encodeRoundParameters(params),
          roundFactoryContract.address
        )).to.be.revertedWith("time has already passed");

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
          amount,
          token,
          initMetaPtr,
          initRoles
        ];

        await expect(newRoundImplementation.initialize(
          encodeRoundParameters(params),
          roundFactoryContract.address
        )).to.be.revertedWith("app end is before app start");

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
          amount,
          token,
          initMetaPtr,
          initRoles
        ];

        await expect(newRoundImplementation.initialize(
          encodeRoundParameters(params),
          roundFactoryContract.address
        )).to.be.revertedWith("round end is before app end");

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
          amount,
          token,
          initMetaPtr,
          initRoles
        ];

        await expect(newRoundImplementation.initialize(
          encodeRoundParameters(params),
          roundFactoryContract.address
        )).to.be.revertedWith("round end is before round start");

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
          amount,
          token,
          initMetaPtr,
          initRoles
        ];

        await expect(newRoundImplementation.initialize(
          encodeRoundParameters(params),
          roundFactoryContract.address
        )).to.be.revertedWith("round start is before app start");

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
          amount,
          token,
          initMetaPtr,
          initRoles
        ];

        await expect(roundImplementation.initialize(
          encodeRoundParameters(params),
          roundFactoryContract.address
        )).to.be.revertedWith("Initializable: contract is already initialized");

      });

    });

    describe('test: updateAmount', () => {

      let _currentBlockTimestamp: number;

      let newAmount = 250;

      beforeEach(async () => {
        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        await initRound(_currentBlockTimestamp);
      });

      it ('SHOULD revert if invoked by wallet who is not round operator', async () => {

        const [_, notRoundOperator] = await ethers.getSigners();

        await expect(roundImplementation.connect(notRoundOperator).updateAmount(newAmount)).to.revertedWith(
          `AccessControl: account ${notRoundOperator.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );

      });

      it ('SHOULD update amount value IF called is round operator', async () => {

        const txn = await roundImplementation.updateAmount(newAmount);
        await txn.wait();

        const amount = await roundImplementation.amount();
        expect(amount).equals(newAmount);
      });

      it ('SHOULD emit AmountUpdated event', async () => {

        const txn = await roundImplementation.updateAmount(newAmount);

        expect(txn)
          .to.emit(roundImplementation, 'AmountUpdated')
          .withArgs(
            newAmount
          );
      });

      it('SHOULD revert if invoked after roundEndTime', async () => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 1500])

        await expect(
          roundImplementation.updateAmount(newAmount)
        ).to.revertedWith("round has ended");
      });
    })

    describe('test: updateRoundMetaPtr', () => {

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
        ).to.revertedWith("round has ended");
      });
    });

    describe('test: updateApplicationMetaPtr', () => {

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
        ).to.revertedWith("round has ended");
      });
    });

    describe('test: updateRoundStartTime', () => {

      let _currentBlockTimestamp: number;
      let newTime: number;

      beforeEach(async () => {

        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        newTime = _currentBlockTimestamp + 110;

        await initRound(_currentBlockTimestamp);
      });

      it ('SHOULD revert if invoked by wallet who is not round operator', async () => {
        const [_, notRoundOperator] = await ethers.getSigners();
        await expect(roundImplementation.connect(notRoundOperator).updateRoundStartTime(newTime)).to.revertedWith(
          `AccessControl: account ${notRoundOperator.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );
      });


      it ('SHOULD revert if roundStartTime is in past', async () => {

        const _time = _currentBlockTimestamp - 100;

        await expect(roundImplementation.updateRoundStartTime(_time)).to.revertedWith(
          'time has already passed'
        );
      });

      it ('SHOULD revert if roundStartTime is before applicationsStartTime', async () => {

        const _time = _currentBlockTimestamp + 50;

        await expect(roundImplementation.updateRoundStartTime(_time)).to.revertedWith(
          'is before app start'
        );
      });

      it ('SHOULD revert if roundStartTime is after roundEndTime', async () => {

        const _time = _currentBlockTimestamp + 1500;

        await expect(roundImplementation.updateRoundStartTime(_time)).to.revertedWith(
          'is after round end'
        );
      });

      it ('SHOULD update roundStartTime value IF called is round operator', async () => {

        const txn = await roundImplementation.updateRoundStartTime(newTime);
        await txn.wait();

        const roundStartTime = await roundImplementation.roundStartTime();
        expect(roundStartTime).equals(newTime);
      });

      it('SHOULD emit RountStartTimeUpdated event', async() => {

        expect(await roundImplementation.updateRoundStartTime(newTime))
          .to.emit(roundImplementation, 'RoundStartTimeUpdated')
          .withArgs(_currentBlockTimestamp + 500, newTime);
      });

      it('SHOULD revert if invoked after roundEndTime', async () => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 1500])

        await expect(
          roundImplementation.updateRoundStartTime(newTime)
        ).to.revertedWith("round has ended");
      });

    });

    describe('test: updateRoundEndTime', () => {

      let _currentBlockTimestamp: number;
      let newTime: number;
      beforeEach(async () => {

        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        newTime = _currentBlockTimestamp + 1500;

        await initRound(_currentBlockTimestamp);
      });

      it ('SHOULD revert if invoked by wallet who is not round operator', async () => {
        const [_, notRoundOperator] = await ethers.getSigners();

        await expect(roundImplementation.connect(notRoundOperator).updateRoundEndTime(newTime)).to.revertedWith(
          `AccessControl: account ${notRoundOperator.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );
      });

      it ('SHOULD revert if roundEndTime is in the past', async () => {

        const _time =_currentBlockTimestamp - 10;

        await expect(roundImplementation.updateRoundEndTime(_time)).to.revertedWith(
          'time has already passed'
        );
      });

      it ('SHOULD revert if roundEndTime is before roundStartTime', async () => {

        const _time = _currentBlockTimestamp + 400;

        await expect(roundImplementation.updateRoundEndTime(_time)).to.revertedWith(
          'is before round start'
        );
      });

      it ('SHOULD revert if roundEndTime is before applicationsEndTime', async () => {

        // Deploy voting strategy
        votingStrategyContract = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategyContract = <MerklePayoutStrategyImplementation>await deployContract(user, payoutStrategyArtifact, []);

        let amount = 100;

        const initAddress = [
          votingStrategyContract.address, // votingStrategy
          payoutStrategyContract.address, // payoutStrategy
        ];

        const initRoundTime = [
          _currentBlockTimestamp + 100, // applicationsStartTime
          _currentBlockTimestamp + 600, // applicationsEndTime
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

        // Deploy Round contract
        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);
        await newRoundImplementation.initialize(
          encodeRoundParameters(params),
          roundFactoryContract.address
        );

        const _time = _currentBlockTimestamp + 550;

        await expect(newRoundImplementation.updateRoundEndTime(_time)).to.revertedWith(
          'is before app end'
        );
      });

      it ('SHOULD update roundEndTime value IF called is round operator', async () => {

        const txn = await roundImplementation.updateRoundEndTime(newTime);
        await txn.wait();

        const roundEndTime = await roundImplementation.roundEndTime();
        expect(roundEndTime).equals(newTime);
      });

      it('SHOULD emit RoundEndTimeUpdated event', async() => {

        expect(await roundImplementation.updateRoundEndTime(newTime))
          .to.emit(roundImplementation, 'RoundEndTimeUpdated')
          .withArgs(_currentBlockTimestamp + 1000, newTime);
      });

      it('SHOULD revert if invoked after roundEndTime', async () => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 150000])

        await expect(
          roundImplementation.updateRoundEndTime(newTime)
        ).to.revertedWith("round has ended");
      });
    });

    describe('test: updateApplicationsStartTime', () => {

      let _currentBlockTimestamp: number;
      let newTime: number;

      beforeEach(async () => {

        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        newTime = _currentBlockTimestamp + 200;

        await initRound(_currentBlockTimestamp);
      });


      it('updateApplicationsStartTime SHOULD revert if invoked by wallet who is not round operator', async () => {
        const [_, notRoundOperator] = await ethers.getSigners();

        await expect(roundImplementation.connect(notRoundOperator).updateApplicationsStartTime(newTime)).to.revertedWith(
          `AccessControl: account ${notRoundOperator.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );
      });

      it ('SHOULD revert if applicationsStartTime is in the past', async () => {

        const _time = _currentBlockTimestamp - 10;

        await expect(roundImplementation.updateApplicationsStartTime(_time)).to.revertedWith(
          'time has already passed'
        );
      });

      it ('SHOULD revert if applicationsStartTime is after roundStartTime', async () => {

        // Deploy voting strategy
        votingStrategyContract = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategyContract = <MerklePayoutStrategyImplementation>await deployContract(user, payoutStrategyArtifact, []);

        let amount = 100;

        const initAddress = [
          votingStrategyContract.address, // votingStrategy
          payoutStrategyContract.address, // payoutStrategy
        ];

        const initRoundTime = [
          _currentBlockTimestamp + 100, // applicationsStartTime
          _currentBlockTimestamp + 500, // applicationsEndTime
          _currentBlockTimestamp + 250, // roundStartTime
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

        // Deploy Round contract
        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);
        await newRoundImplementation.initialize(
          encodeRoundParameters(params),
          roundFactoryContract.address
        );

        const _time = _currentBlockTimestamp + 300;

        await expect(newRoundImplementation.updateApplicationsStartTime(_time)).to.revertedWith(
          'is after round start'
        );
      });

      it ('SHOULD revert if applicationsStartTime is after applicationsEndTime', async () => {

        const _time = _currentBlockTimestamp + 400;

        await expect(roundImplementation.updateApplicationsStartTime(_time)).to.revertedWith(
          'is after app end'
        );
      });

      it ('SHOULD update applicationsStartTime value IF called is round operator', async () => {

        const txn = await roundImplementation.updateApplicationsStartTime(newTime);
        await txn.wait();

        const applicationsStartTime = await roundImplementation.applicationsStartTime();
        expect(applicationsStartTime).equals(newTime);
      });

      it('SHOULD emit ApplicationsStartTimeUpdated event', async() => {
        const applicationsStartTime = await roundImplementation.applicationsStartTime();

        expect(await roundImplementation.updateApplicationsStartTime(newTime))
          .to.emit(roundImplementation, 'ApplicationsStartTimeUpdated')
          .withArgs(applicationsStartTime, newTime);
      });

      it('SHOULD revert if invoked after roundEndTime', async () => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 150000])

        await expect(
          roundImplementation.updateApplicationsStartTime(newTime)
        ).to.revertedWith("round has ended");
      });

    });

    describe('test: updateApplicationsEndTime', () => {

      let newTime: number;

      let _currentBlockTimestamp: number;

      beforeEach(async () => {

        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        newTime = _currentBlockTimestamp + 300;

        await initRound(_currentBlockTimestamp);
      });

      it ('SHOULD revert if invoked by wallet who is not round operator', async () => {

        const [_, notRoundOperator] = await ethers.getSigners();

        await expect(roundImplementation.connect(notRoundOperator).updateApplicationsEndTime(newTime)).to.revertedWith(
          `AccessControl: account ${notRoundOperator.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );
      });

      it('SHOULD revert if applicationsEndTime has already passed', async () => {

        const _time = _currentBlockTimestamp - 10;

        await expect(roundImplementation.updateApplicationsEndTime(_time)).to.revertedWith(
          'time has already passed'
        );
      });

      it('SHOULD revert if applicationsEndTime is before applicationsStartTime', async () => {

        const _time = _currentBlockTimestamp + 50;

        await expect(roundImplementation.updateApplicationsEndTime(_time)).to.revertedWith(
          'is before app start'
        );
      });

      it('SHOULD revert if applicationsEndTime is after roundEndTime', async () => {

        const _time =  _currentBlockTimestamp + 1500;

        await expect(roundImplementation.updateApplicationsEndTime(_time)).to.revertedWith(
          'is after round end'
        );
      });

      it('SHOULD update roundEndTime value IF called is round operator', async () => {

        const txn = await roundImplementation.updateApplicationsEndTime(newTime);
        await txn.wait();

        const applicationsEndTime = await roundImplementation.applicationsEndTime();
        expect(applicationsEndTime).equals(newTime);
      });

      it('SHOULD emit RoundEndTimeUpdated event', async() => {

        const applicationsEndTime = await roundImplementation.applicationsEndTime();

        expect(await roundImplementation.updateApplicationsEndTime(newTime))
          .to.emit(roundImplementation, 'ApplicationsEndTimeUpdated')
          .withArgs(applicationsEndTime, newTime);
      });

      it('SHOULD revert if invoked after roundEndTime', async () => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 2000]);

        await expect(
          roundImplementation.updateApplicationsEndTime(newTime)
        ).to.revertedWith("round has ended");
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

        await expect(roundImplementation.updateProjectsMetaPtr(randomMetaPtr)).to.revertedWith("round has ended");
      });

    });

    describe('test: applyToRound', () => {

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
          "applications period over"
        );
      });

      it('SHOULD revert WHEN invoked after applicationsEndTime', async () => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 7500])

        await expect(roundImplementation.applyToRound(projectID, newProjectMetaPtr)).to.be.revertedWith(
          "applications period over"
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

    describe('test: vote', () => {

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
          "round is not active"
        );
      });

      it('SHOULD revert WHEN invoked after roundEndTime', async () => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 18000])

        await expect(roundImplementation.vote(encodedVotes)).to.be.revertedWith(
          "round is not active"
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

    describe('test: payout', () => {
      // TODO: Add tests
      it('SHOULD revert when round has ended', async () => {

      });

      it('SHOULD revert when called is not round operator', async () => {

      });

      it('SHOULD revert when round contract does not have enough funds', async () => {

      });

      describe('ERC20 payout', () => {
        it("SHOULD transfer fee to protocolTreasury", async () => {

        });

        it("SHOULD transfer pot amount to payout contract", async () => {

        });

        it("SHOULD emit PayFeeAndEscrowFundsToPayoutContract", async () => {

        });

        it("Funds in round contract SHOULD always be 0 after payout", async () => {

        });

        it("Funds in round contract SHOULD be 0 even if funds in contract > required amount", async () => {

        });
      });

      describe('Native token payout', () => {
        it("SHOULD transfer fee to protocolTreasury", async () => {

        });

        it("SHOULD transfer pot amount to payout contract", async () => {

        });

        it("SHOULD emit PayFeeAndEscrowFundsToPayoutContract", async () => {

        });

        it("Funds in round contract SHOULD be 0 after payout", async () => {

        });
      });

    });

  })

});
