import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { BigNumberish, ContractTransaction, Wallet } from "ethers";
import { BytesLike, isAddress } from "ethers/lib/utils";
import { artifacts, ethers } from "hardhat";
import { Artifact } from "hardhat/types";
import { encodeMerkleUpdateDistributionParameters, encodeRoundParameters } from "../../scripts/utils";
import { MockERC20, QuadraticFundingVotingStrategyImplementation, RoundImplementation } from "../../typechain";
import { MerklePayoutStrategy } from "../../typechain/MerklePayoutStrategy";


type MetaPtr = {
  protocol: BigNumberish;
  pointer: string;
}

describe("RoundImplementation", function () {

  let user: SignerWithAddress;

  // Round Implementation
  let roundImplementation: RoundImplementation;
  let roundImplementationArtifact: Artifact;

  // Voting Strategy
  let votingStrategy: QuadraticFundingVotingStrategyImplementation;
  let votingStrategyArtifact: Artifact;

  // Payout Strategy
  let payoutStrategy: MerklePayoutStrategy;
  let payoutStrategyArtifact: Artifact;

  // Variable declarations
  let _roundStartTime: BigNumberish;
  let _applicationsStartTime: BigNumberish;
  let _applicationsEndTime: BigNumberish;
  let _roundEndTime: BigNumberish;
  let _token: string;
  let _votingStrategy: string;
  let _payoutStrategy: string;
  let _roundMetaPtr: MetaPtr;
  let _applicationMetaPtr: MetaPtr;
  let _adminRoles: string[];
  let _roundOperators: string[];

  const ROUND_OPERATOR_ROLE = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("ROUND_OPERATOR")
  );

  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

  before(async () => {
    [user] = await ethers.getSigners();

    // Deploy VotingStrategy contract
    votingStrategyArtifact = await artifacts.readArtifact('QuadraticFundingVotingStrategyImplementation');
    votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);

    // Deploy PayoutStrategy contract
    payoutStrategyArtifact = await artifacts.readArtifact('MerklePayoutStrategy');
    payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);

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

    before(async() => {
      _applicationsStartTime = Math.round(new Date().getTime() / 1000 + 3600); // 1 hour later
      _applicationsEndTime = Math.round(new Date().getTime() / 1000 + 7200); // 2 hours later
      _roundStartTime = Math.round(new Date().getTime() / 1000 + 10800); // 3 hours later
      _roundEndTime = Math.round(new Date().getTime() / 1000 + 14400); // 4 hours later

      _token = Wallet.createRandom().address;
      _votingStrategy = Wallet.createRandom().address;
      _payoutStrategy = Wallet.createRandom().address;
      _roundMetaPtr = { protocol: 1, pointer: "bafybeia4khbew3r2mkflyn7nzlvfzcb3qpfeftz5ivpzfwn77ollj47gqi" };
      _applicationMetaPtr = { protocol: 1, pointer: "bafybeiaoakfoxjwi2kwh43djbmomroiryvhv5cetg74fbtzwef7hzzvrnq" };
      _adminRoles = [ user.address ];
      _roundOperators = [
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
      let initializeTxn: ContractTransaction;

      beforeEach(async () => {
        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);


        let params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, // _payoutStrategyAddress
          _currentBlockTimestamp + 100, // _applicationsStartTime
          _currentBlockTimestamp + 250, // _applicationsEndTime
          _currentBlockTimestamp + 500, // _roundStartTime
          _currentBlockTimestamp + 1000, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRoles, // _adminRoles
          _roundOperators // _roundOperators
        ];

        initializeTxn = await roundImplementation.initialize(
          encodeRoundParameters(params)
        );

      })


      it ('default values MUST match the arguments while invoking initialize', async () => {

        // check roles
        expect(await roundImplementation.ROUND_OPERATOR_ROLE()).equals(ROUND_OPERATOR_ROLE);
        expect(await roundImplementation.DEFAULT_ADMIN_ROLE()).equals(DEFAULT_ADMIN_ROLE);

        expect(await roundImplementation.votingStrategy()).equals(votingStrategy.address);
        expect(await roundImplementation.payoutStrategy()).equals(payoutStrategy.address);
        expect(await roundImplementation.applicationsStartTime()).equals(_currentBlockTimestamp + 100);
        expect(await roundImplementation.applicationsEndTime()).equals(_currentBlockTimestamp + 250);
        expect(await roundImplementation.roundStartTime()).equals(_currentBlockTimestamp + 500);
        expect(await roundImplementation.roundEndTime()).equals(_currentBlockTimestamp + 1000);
        expect(await roundImplementation.token()).equals(_token);

        const roundMetaPtr = await roundImplementation.roundMetaPtr();
        expect(roundMetaPtr.pointer).equals(_roundMetaPtr.pointer);
        expect(roundMetaPtr.protocol).equals(_roundMetaPtr.protocol);

        const applicationMetaPtr = await roundImplementation.applicationMetaPtr();
        expect(applicationMetaPtr.pointer).equals(_applicationMetaPtr.pointer);
        expect(applicationMetaPtr.protocol).equals(_applicationMetaPtr.protocol);

        expect(await roundImplementation.getRoleMemberCount(DEFAULT_ADMIN_ROLE)).equals(_adminRoles.length);
        expect(await roundImplementation.getRoleMember(DEFAULT_ADMIN_ROLE, 0)).equals(_adminRoles[0]);

        expect(await roundImplementation.getRoleMemberCount(ROUND_OPERATOR_ROLE)).equals(_roundOperators.length);
        expect(await roundImplementation.getRoleMember(ROUND_OPERATOR_ROLE, 0)).equals(_roundOperators[0]);
        expect(await roundImplementation.getRoleMember(ROUND_OPERATOR_ROLE, 1)).equals(_roundOperators[1]);
      });


      it ('initialize SHOULD revert when applicationsStartTime is in the past', async () => {

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);

        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        let params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _currentBlockTimestamp - 100, // _applicationsStartTime
          _currentBlockTimestamp + 250, // _applicationsEndTime
          _currentBlockTimestamp + 500, // _roundStartTime
          _currentBlockTimestamp + 1000, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRoles, // _adminRoles
          _roundOperators // _roundOperators
        ];

        await expect(newRoundImplementation.initialize(
          encodeRoundParameters(params)
        )).to.be.revertedWith("initialize: applications start time has already passed");

      });


      it ('initialize SHOULD revert when applicationsStartTime is after applicationsEndTime', async () => {

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);

        const _time = Math.round(new Date().getTime() / 1000 - 259200); // 3 days earlier
        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        let params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _applicationsStartTime, // _applicationsStartTime
          _time, // _applicationsEndTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRoles, // _adminRoles
          _roundOperators // _roundOperators
        ];

        await expect(newRoundImplementation.initialize(
          encodeRoundParameters(params)
        )).to.be.revertedWith("initialize: application end time should be after application start time");

      });

      it ('initialize SHOULD revert if applicationsEndTime is after roundEndTime', async () => {

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);

        const _time = Math.round(new Date().getTime() / 1000); // current time
        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        let params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _applicationsStartTime, // _applicationsStartTime
          _applicationsEndTime, // _applicationsEndTime
          _roundStartTime, // _roundStartTime
          _time, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRoles, // _adminRoles
          _roundOperators // _roundOperators
        ];

        await expect(newRoundImplementation.initialize(
          encodeRoundParameters(params)
        )).to.be.revertedWith("initialize: application end time should be before round end time");

      });

      it ('initialize SHOULD revert if roundEndTime is after roundStartTime', async () => {

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);


        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        let params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _currentBlockTimestamp + 100, // _applicationsStartTime
          _currentBlockTimestamp + 250, // _applicationsEndTime
          _currentBlockTimestamp + 1000, // _roundStartTime
          _currentBlockTimestamp + 500, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRoles, // _adminRoles
          _roundOperators // _roundOperators
        ];

        await expect(newRoundImplementation.initialize(
          encodeRoundParameters(params)
        )).to.be.revertedWith("initialize: end time should be after start time");

      });

      it ('initialize SHOULD revert when applicationsStartTime is after roundStartTime', async () => {

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);


        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        let params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _currentBlockTimestamp + 100, // _applicationsStartTime
          _currentBlockTimestamp + 250, // _applicationsEndTime
          _currentBlockTimestamp + 50, // _roundStartTime
          _currentBlockTimestamp + 1000, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRoles, // _adminRoles
          _roundOperators // _roundOperators
        ];

        await expect(newRoundImplementation.initialize(
          encodeRoundParameters(params)
        )).to.be.revertedWith("initialize: round start time should be after application start time");

      });

      it ('initialize CANNOT not be invoked on already initialized contract ', async () => {

        let params = [
          _votingStrategy, // _votingStrategyAddress
          _payoutStrategy, //_payoutStrategyAddress
          _applicationsStartTime, // _applicationsStartTime
          _applicationsEndTime, // _applicationsEndTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRoles, // _adminRoles
          _roundOperators // _roundOperators
        ];

        await expect(roundImplementation.initialize(
          encodeRoundParameters(params)
        )).to.be.revertedWith("Initializable: contract is already initialized");

      });

      it('invoking initialize MUST fire Events', async () => {

        const defaultPointer = { protocol: 0, pointer: "" };

        expect(initializeTxn)
          .to.emit(roundImplementation,  'RoundMetaPtrUpdated')
          .withArgs(
            [ defaultPointer.protocol, defaultPointer.pointer ],
            [ _roundMetaPtr.protocol, _roundMetaPtr.pointer ]
          );

        expect(initializeTxn)
          .to.emit(roundImplementation,  'ApplicationMetaPtrUpdated')
          .withArgs(
            [ defaultPointer.protocol, defaultPointer.pointer ],
            [ _applicationMetaPtr.protocol, _applicationMetaPtr.pointer ]
          );
      });

    });

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

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);


        let params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _currentBlockTimestamp + 100, // _applicationsStartTime
          _currentBlockTimestamp + 600, // _applicationsEndTime
          _currentBlockTimestamp + 500, // _roundStartTime
          _currentBlockTimestamp + 1000, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRoles, // _adminRoles
          _roundOperators // _roundOperators
        ];

        await roundImplementation.initialize(
          encodeRoundParameters(params)
        );

      });

      it ('updateRoundMetaPtr SHOULD revert if invoked by wallet who is not round operator', async () => {

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);


        const randomWallet = Wallet.createRandom().address;

        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        let params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _currentBlockTimestamp + 100, // _applicationsStartTime
          _currentBlockTimestamp + 600, // _applicationsEndTime
          _currentBlockTimestamp + 500, // _roundStartTime
          _currentBlockTimestamp + 1000, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          [randomWallet], // _adminRoles
          [randomWallet] // _roundOperators
        ];

        const txn = await newRoundImplementation.initialize(
          encodeRoundParameters(params)
        );

        txn.wait();

        await expect(newRoundImplementation.updateRoundMetaPtr(randomMetaPtr)).to.revertedWith(
          `AccessControl: account ${user.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );

      });

      it ('invoking updateRoundMetaPtr SHOULD update roundMetaPtr value IF called is round operator', async () => {

        const txn = await roundImplementation.updateRoundMetaPtr(randomMetaPtr);
        await txn.wait();

        const roundMetaPtr = await roundImplementation.roundMetaPtr();
        expect(roundMetaPtr.pointer).equals(randomMetaPtr.pointer);
        expect(roundMetaPtr.protocol).equals(randomMetaPtr.protocol);
      });

      it ('invoking updateRoundMetaPtr SHOULD emit RoundMetaPtrUpdated event', async () => {

        const txn = await roundImplementation.updateRoundMetaPtr(randomMetaPtr);

        expect(txn)
          .to.emit(roundImplementation, 'RoundMetaPtrUpdated')
          .withArgs(
            [ _roundMetaPtr.protocol, _roundMetaPtr.pointer ],
            [ randomMetaPtr.protocol, randomMetaPtr.pointer ]
          );
      });

      it('invoking updateRoundMetaPtr SHOULD revert if invoked after roundEndTime', async () => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 1500])

        await expect(
          roundImplementation.updateRoundMetaPtr(randomMetaPtr)
        ).to.revertedWith("error: round has ended");
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

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);


        let params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _applicationsStartTime, // _applicationsStartTime
          _applicationsEndTime, // _applicationsEndTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRoles, // _adminRoles
          _roundOperators // _roundOperators
        ];

        await roundImplementation.initialize(
          encodeRoundParameters(params)
        );
      });

      it ('updateApplicationMetaPtr SHOULD revert if invoked by wallet who is not round operator', async () => {

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);


        const randomWallet = Wallet.createRandom().address;
        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        let params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _applicationsStartTime, // _applicationsStartTime
          _applicationsEndTime, // _applicationsEndTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          [randomWallet], // _adminRoles
          [randomWallet] // _roundOperators
        ];

        const txn = await newRoundImplementation.initialize(
          encodeRoundParameters(params)
        );

        txn.wait();

        await expect(newRoundImplementation.updateApplicationMetaPtr(randomMetaPtr)).to.revertedWith(
          `AccessControl: account ${user.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );

      });

      it ('invoking updateApplicationMetaPtr SHOULD update applicationMetaPtr value IF called is round operator', async () => {
        const txn = await roundImplementation.updateApplicationMetaPtr(randomMetaPtr);
        await txn.wait();

        const applicationMetaPtr = await roundImplementation.applicationMetaPtr();
        expect(applicationMetaPtr.pointer).equals(randomMetaPtr.pointer);
        expect(applicationMetaPtr.protocol).equals(randomMetaPtr.protocol);
      });

      it ('invoking updateApplicationMetaPtr SHOULD emit ApplicationMetaPtrUpdated event', async () => {

        const txn = await roundImplementation.updateApplicationMetaPtr(randomMetaPtr);

        expect(txn)
          .to.emit(roundImplementation, 'ApplicationMetaPtrUpdated')
          .withArgs(
            [ _applicationMetaPtr.protocol, _applicationMetaPtr.pointer ],
            [ randomMetaPtr.protocol, randomMetaPtr.pointer ]
          );
      });

      it('invoking updateApplicationMetaPtr SHOULD revert if invoked after roundEndTime', async () => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 150000])

        await expect(
          roundImplementation.updateApplicationMetaPtr(randomMetaPtr)
        ).to.revertedWith("error: round has ended");
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

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);


        const params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _currentBlockTimestamp + 100, // _applicationsStartTime
          _currentBlockTimestamp + 250, // _applicationsEndTime
          _currentBlockTimestamp + 500, // _roundStartTime
          _currentBlockTimestamp + 1000, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRoles, // _adminRoles
          _roundOperators // _roundOperators
        ];

        await roundImplementation.initialize(
          encodeRoundParameters(params)
        );

      });

      it ('invoking updateRoundStartTime SHOULD revert if invoked by wallet who is not round operator', async () => {

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);

        const randomWallet = Wallet.createRandom().address;
        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        const params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _currentBlockTimestamp + 100, // _applicationsStartTime
          _currentBlockTimestamp + 250, // _applicationsEndTime
          _currentBlockTimestamp + 500, // _roundStartTime
          _currentBlockTimestamp + 1000, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          [randomWallet], // _adminRoles
          [randomWallet] // _roundOperators
        ];

        await newRoundImplementation.initialize(
          encodeRoundParameters(params)
        );

        await expect(newRoundImplementation.updateRoundStartTime(newTime)).to.revertedWith(
          `AccessControl: account ${user.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );
      });


      it ('invoking updateRoundStartTime SHOULD revert if roundStartTime is in past', async () => {

        const _time = _currentBlockTimestamp - 100;

        await expect(roundImplementation.updateRoundStartTime(_time)).to.revertedWith(
          'updateRoundStartTime: start time has already passed'
        );
      });

      it ('invoking updateRoundStartTime SHOULD revert if roundStartTime is before applicationsStartTime', async () => {

        const _time = _currentBlockTimestamp + 50;

        await expect(roundImplementation.updateRoundStartTime(_time)).to.revertedWith(
          'updateRoundStartTime: start time should be after application start time'
        );
      });

      it ('invoking updateRoundStartTime SHOULD revert if roundStartTime is after roundEndTime', async () => {

        const _time = _currentBlockTimestamp + 1500;

        await expect(roundImplementation.updateRoundStartTime(_time)).to.revertedWith(
          'updateRoundStartTime: start time should be before round end time'
        );
      });

      it ('invoking updateRoundStartTime SHOULD update roundStartTime value IF called is round operator', async () => {

        const txn = await roundImplementation.updateRoundStartTime(newTime);
        await txn.wait();

        const roundStartTime = await roundImplementation.roundStartTime();
        expect(roundStartTime).equals(newTime);
      });

      it('invoking updateRoundStartTime SHOULD emit RountStartTimeUpdated event', async() => {

        expect(await roundImplementation.updateRoundStartTime(newTime))
          .to.emit(roundImplementation, 'RoundStartTimeUpdated')
          .withArgs(_currentBlockTimestamp + 500, newTime);
      });

      it('invoking updateRoundStartTime SHOULD revert if invoked after roundEndTime', async () => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 1500])

        await expect(
          roundImplementation.updateRoundStartTime(newTime)
        ).to.revertedWith("error: round has ended");
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

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);

        const params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _currentBlockTimestamp + 100, // _applicationsStartTime
          _currentBlockTimestamp + 250, // _applicationsEndTime
          _currentBlockTimestamp + 500, // _roundStartTime
          _currentBlockTimestamp + 1000, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRoles, // _adminRoles
          _roundOperators // _roundOperators
        ];

        await roundImplementation.initialize(
          encodeRoundParameters(params)
        );

      });

      it ('invoking updateRoundEndTime SHOULD revert if invoked by wallet who is not round operator', async () => {

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);

        const randomWallet = Wallet.createRandom().address;
        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        const params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _currentBlockTimestamp + 100, // _applicationsStartTime
          _currentBlockTimestamp + 250, // _applicationsEndTime
          _currentBlockTimestamp + 500, // _roundStartTime
          _currentBlockTimestamp + 1000, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          [randomWallet], // _adminRoles
          [randomWallet] // _roundOperators
        ];

        await newRoundImplementation.initialize(
          encodeRoundParameters(params)
        );

        await expect(newRoundImplementation.updateRoundEndTime(newTime)).to.revertedWith(
          `AccessControl: account ${user.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );
      });

      it ('invoking updateRoundEndTime SHOULD revert if roundEndTime is in the past', async () => {

        const _time =_currentBlockTimestamp - 10;

        await expect(roundImplementation.updateRoundEndTime(_time)).to.revertedWith(
          'updateRoundEndTime: end time has already passed'
        );
      });

      it ('invoking updateRoundEndTime SHOULD revert if roundEndTime is before roundStartTime', async () => {

        const _time = _currentBlockTimestamp + 400;

        await expect(roundImplementation.updateRoundEndTime(_time)).to.revertedWith(
          'updateRoundEndTime: end time should be after start time'
        );
      });

      it ('invoking updateRoundEndTime SHOULD revert if roundEndTime is before applicationsEndTime', async () => {

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);

        let params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _currentBlockTimestamp + 100, // _applicationsStartTime
          _currentBlockTimestamp + 600, // _applicationsEndTime
          _currentBlockTimestamp + 500, // _roundStartTime
          _currentBlockTimestamp + 1000, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRoles, // _adminRoles
          _roundOperators // _roundOperators
        ];

        // Deploy Round contract
        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);
        await newRoundImplementation.initialize(encodeRoundParameters(params));

        const _time = _currentBlockTimestamp + 550;

        await expect(newRoundImplementation.updateRoundEndTime(_time)).to.revertedWith(
          'updateRoundEndTime: end time should be after application end time'
        );
      });

      it ('invoking updateRoundEndTime SHOULD update roundEndTime value IF called is round operator', async () => {

        const txn = await roundImplementation.updateRoundEndTime(newTime);
        await txn.wait();

        const roundEndTime = await roundImplementation.roundEndTime();
        expect(roundEndTime).equals(newTime);
      });

      it('invoking updateRoundEndTime SHOULD emit RoundEndTimeUpdated event', async() => {

        expect(await roundImplementation.updateRoundEndTime(newTime))
          .to.emit(roundImplementation, 'RoundEndTimeUpdated')
          .withArgs(_currentBlockTimestamp + 1000, newTime);
      });

      it('invoking updateRoundEndTime SHOULD revert if invoked after roundEndTime', async () => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 150000])

        await expect(
          roundImplementation.updateRoundEndTime(newTime)
        ).to.revertedWith("error: round has ended");
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

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);

        const params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _currentBlockTimestamp + 100, // _applicationsStartTime
          _currentBlockTimestamp + 250, // _applicationsEndTime
          _currentBlockTimestamp + 500, // _roundStartTime
          _currentBlockTimestamp + 1000, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRoles, // _adminRoles
          _roundOperators // _roundOperators
        ];

        await roundImplementation.initialize(
          encodeRoundParameters(params)
        );
      });


      it('updateApplicationsStartTime SHOULD revert if invoked by wallet who is not round operator', async () => {

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);

        const randomWallet = Wallet.createRandom().address;
        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        const params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _currentBlockTimestamp + 100, // _applicationsStartTime
          _currentBlockTimestamp + 250, // _applicationsEndTime
          _currentBlockTimestamp + 500, // _roundStartTime
          _currentBlockTimestamp + 1000, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          [randomWallet], // _adminRoles
          [randomWallet] // _roundOperators
        ];

        await newRoundImplementation.initialize(
          encodeRoundParameters(params)
        );

        await expect(newRoundImplementation.updateApplicationsStartTime(newTime)).to.revertedWith(
          `AccessControl: account ${user.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );
      });

      it ('invoking updateApplicationsStartTime SHOULD revert if applicationsStartTime is in the past', async () => {

        const _time = _currentBlockTimestamp - 10;

        await expect(roundImplementation.updateApplicationsStartTime(_time)).to.revertedWith(
          'updateApplicationsStartTime: application start time has already passed'
        );
      });

      it ('invoking updateApplicationsStartTime SHOULD revert if applicationsStartTime is after roundStartTime', async () => {

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);

        const params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _currentBlockTimestamp + 100, // _applicationsStartTime
          _currentBlockTimestamp + 500, // _applicationsEndTime
          _currentBlockTimestamp + 250, // _roundStartTime
          _currentBlockTimestamp + 1000, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRoles, // _adminRoles
          _roundOperators // _roundOperators
        ];

        // Deploy Round contract
        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);
        await newRoundImplementation.initialize(encodeRoundParameters(params));

        const _time = _currentBlockTimestamp + 300;

        await expect(newRoundImplementation.updateApplicationsStartTime(_time)).to.revertedWith(
          'updateApplicationsStartTime: should be before round start time'
        );
      });

      it ('invoking updateApplicationsStartTime SHOULD revert if applicationsStartTime is after applicationsEndTime', async () => {

        const _time = _currentBlockTimestamp + 400;

        await expect(roundImplementation.updateApplicationsStartTime(_time)).to.revertedWith(
          'updateApplicationsStartTime: should be before application end time'
        );
      });

      it ('invoking updateApplicationsStartTime SHOULD update applicationsStartTime value IF called is round operator', async () => {

        const txn = await roundImplementation.updateApplicationsStartTime(newTime);
        await txn.wait();

        const applicationsStartTime = await roundImplementation.applicationsStartTime();
        expect(applicationsStartTime).equals(newTime);
      });

      it('invoking updateApplicationsStartTime SHOULD emit ApplicationsStartTimeUpdated event', async() => {
        const applicationsStartTime = await roundImplementation.applicationsStartTime();

        expect(await roundImplementation.updateApplicationsStartTime(newTime))
          .to.emit(roundImplementation, 'ApplicationsStartTimeUpdated')
          .withArgs(applicationsStartTime, newTime);
      });

      it('invoking updateApplicationsStartTime SHOULD revert if invoked after roundEndTime', async () => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 150000])

        await expect(
          roundImplementation.updateApplicationsStartTime(newTime)
        ).to.revertedWith("error: round has ended");
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

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);

        let params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _currentBlockTimestamp + 100, // _applicationsStartTime
          _currentBlockTimestamp + 250, // _applicationsEndTime
          _currentBlockTimestamp + 500, // _roundStartTime
          _currentBlockTimestamp + 1000, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRoles, // _adminRoles
          _roundOperators // _roundOperators
        ];

        await roundImplementation.initialize(encodeRoundParameters(params));
      });

      it ('invoking updateApplicationsEndTime SHOULD revert if invoked by wallet who is not round operator', async () => {

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);

        const randomWallet = Wallet.createRandom().address;
        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        let params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _currentBlockTimestamp + 100, // _applicationsStartTime
          _currentBlockTimestamp + 250, // _applicationsEndTime
          _currentBlockTimestamp + 500, // _roundStartTime
          _currentBlockTimestamp + 1000, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          [randomWallet], // _adminRoles
          [randomWallet] // _roundOperators
        ];

        await newRoundImplementation.initialize(
          encodeRoundParameters(params)
        );

        await expect(newRoundImplementation.updateApplicationsEndTime(newTime)).to.revertedWith(
          `AccessControl: account ${user.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );
      });

      it('invoking updateApplicationsEndTime SHOULD revert if applicationsEndTime has already passed', async () => {

        const _time = _currentBlockTimestamp - 10;

        await expect(roundImplementation.updateApplicationsEndTime(_time)).to.revertedWith(
          'updateApplicationsEndTime: application end time has already passed'
        );
      });

      it('invoking updateApplicationsEndTime SHOULD revert if applicationsEndTime is before applicationsStartTime', async () => {

        const _time = _currentBlockTimestamp + 50;

        await expect(roundImplementation.updateApplicationsEndTime(_time)).to.revertedWith(
          'updateApplicationsEndTime: application end time should be after application start time'
        );
      });

      it('invoking updateApplicationsEndTime SHOULD revert if applicationsEndTime is after roundEndTime', async () => {

        const _time =  _currentBlockTimestamp + 1500;

        await expect(roundImplementation.updateApplicationsEndTime(_time)).to.revertedWith(
          'updateApplicationsEndTime: should be before round end time'
        );
      });

      it('invoking updateApplicationsEndTime SHOULD update roundEndTime value IF called is round operator', async () => {

        const txn = await roundImplementation.updateApplicationsEndTime(newTime);
        await txn.wait();

        const applicationsEndTime = await roundImplementation.applicationsEndTime();
        expect(applicationsEndTime).equals(newTime);
      });

      it('invoking updateApplicationsEndTime SHOULD emit RoundEndTimeUpdated event', async() => {

        const applicationsEndTime = await roundImplementation.applicationsEndTime();

        expect(await roundImplementation.updateApplicationsEndTime(newTime))
          .to.emit(roundImplementation, 'ApplicationsEndTimeUpdated')
          .withArgs(applicationsEndTime, newTime);
      });

      it('invoking updateApplicationsEndTime SHOULD revert if invoked after roundEndTime', async () => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 2000]);

        await expect(
          roundImplementation.updateApplicationsEndTime(newTime)
        ).to.revertedWith("error: round has ended");
      });

    });

    describe('test: updateProjectsMetaPtr', () => {

      let roundImplementation: RoundImplementation;

      let params: any[];
      let _currentBlockTimestamp: number;

      const randomWallet = Wallet.createRandom().address;
      const defaultPointer = { protocol: 0, pointer: "" };
      const randomMetaPtr: MetaPtr = {
        protocol: 1,
        pointer: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
      };

      beforeEach(async() => {

        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);
        // Deploy Round contract
        roundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _currentBlockTimestamp + 100, // _applicationsStartTime
          _currentBlockTimestamp + 250, // _applicationsEndTime
          _currentBlockTimestamp + 500, // _roundStartTime
          _currentBlockTimestamp + 1000, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          [user.address], // _adminRoles
          [user.address] // _roundOperators
        ];

      });

      it('invoking updateProjectsMetaPtr SHOULD update roundMetaPtr value IF called is round operator', async () => {

        await roundImplementation.initialize(encodeRoundParameters(params));

        const txn = await roundImplementation.updateProjectsMetaPtr(randomMetaPtr);
        await txn.wait();

        const projectsMetaPtr = await roundImplementation.projectsMetaPtr();
        expect(projectsMetaPtr.pointer).equals(randomMetaPtr.pointer);
        expect(projectsMetaPtr.protocol).equals(randomMetaPtr.protocol);
      });

      it('invoking updateProjectsMetaPtr SHOULD emit ProjectsMetaPtrUpdated event', async () => {

        await roundImplementation.initialize(encodeRoundParameters(params));

        const txn = await roundImplementation.updateProjectsMetaPtr(randomMetaPtr);

        expect(txn)
          .to.emit(roundImplementation, 'ProjectsMetaPtrUpdated')
          .withArgs(
            [ defaultPointer.protocol,  defaultPointer.pointer ],
            [ randomMetaPtr.protocol, randomMetaPtr.pointer ]
          );
      });

      it('updateProjectsMetaPtr SHOULD revert if invoked by wallet who is not round operator', async () => {

        let params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _currentBlockTimestamp + 100, // _applicationsStartTime
          _currentBlockTimestamp + 250, // _applicationsEndTime
          _currentBlockTimestamp + 500, // _roundStartTime
          _currentBlockTimestamp + 1000, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          [randomWallet], // _adminRoles
          [randomWallet] // _roundOperators
        ];

        await roundImplementation.initialize(encodeRoundParameters(params));

        await expect(roundImplementation.updateProjectsMetaPtr(randomMetaPtr)).to.revertedWith(
          `AccessControl: account ${user.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );

      });

      it('invoking updateProjectsMetaPtr SHOULD revert if invoked after roundEndTime', async () => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 1500])

        await expect(roundImplementation.updateProjectsMetaPtr(randomMetaPtr)).to.revertedWith("error: round has ended");
      });

    });

    describe('test: applyToRound', () => {

      let projectID: string;
      let newProjectMetaPtr: MetaPtr;

      let roundImplementation: RoundImplementation;
      let _currentBlockTimestamp: number;
      let params: any[];

      before(async() => {

        projectID = ethers.utils.hexlify(ethers.utils.randomBytes(32));

        newProjectMetaPtr = {
          protocol: 1,
          pointer: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
        };
      });

      beforeEach(async() => {

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);

        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _currentBlockTimestamp + 100, // _applicationsStartTime
          _currentBlockTimestamp + 250, // _applicationsEndTime
          _currentBlockTimestamp + 500, // _roundStartTime
          _currentBlockTimestamp + 1000, // _roundEndTime
          Wallet.createRandom().address, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRoles, // _adminRoles
          _roundOperators // _roundOperators
        ];

        roundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);
        await roundImplementation.initialize(encodeRoundParameters(params));

      });

      it('invoking applyToRound SHOULD revert WHEN invoked before applicationsStartTime has started', async () => {
        await expect(roundImplementation.applyToRound(projectID, newProjectMetaPtr)).to.be.revertedWith(
          "applyToRound: round is not accepting application"
        );
      });

      it('invoking applyToRound SHOULD revert WHEN invoked after applicationsEndTime', async () => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 7500])

        await expect(roundImplementation.applyToRound(projectID, newProjectMetaPtr)).to.be.revertedWith(
          "applyToRound: round is not accepting application"
        );
      });

      it('invoking applyToRound SHOULD emit NewProjectApplication event', async() => {

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

      before(async () => {
        let mockERC20Artifact = await artifacts.readArtifact('MockERC20');
        mockERC20 = <MockERC20>await deployContract(user, mockERC20Artifact, [10000]);

        await mockERC20.approve(votingStrategy.address, 100);

        // Prepare Votes
        const votes = [
          [mockERC20.address, 5,  Wallet.createRandom().address]
        ];

        for (let i = 0; i < votes.length; i++) {
          encodedVotes.push(ethers.utils.defaultAbiCoder.encode(
            ["address", "uint256", "address"],
            votes[i]
          ));
        }
      });

      this.beforeEach(async () => {
        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;
      })

      it('invoking vote SHOULD revert WHEN invoked before roundStartTime', async () => {
        await expect(roundImplementation.vote(encodedVotes)).to.be.revertedWith(
          "vote: round is not active"
        );
      });

      it('invoking vote SHOULD revert WHEN invoked after roundEndTime', async () => {

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 18000])

        await expect(roundImplementation.vote(encodedVotes)).to.be.revertedWith(
          "vote: round is not active"
        );
      });

      it('invoking vote with encoded votes SHOULD NOT revert when round is active', async () => {

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);

        await mockERC20.approve(votingStrategy.address, 100);

        const params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _currentBlockTimestamp + 100, // _applicationsStartTime
          _currentBlockTimestamp + 250, // _applicationsEndTime
          _currentBlockTimestamp + 500, // _roundStartTime
          _currentBlockTimestamp + 1000, // _roundEndTime
          mockERC20.address, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRoles, // _adminRoles
          _roundOperators // _roundOperators
        ];

        // Deploy Round contract
        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);
        await newRoundImplementation.initialize(encodeRoundParameters(params));

        // Mine Blocks
        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 900])

        await expect(newRoundImplementation.vote(encodedVotes)).to.not.be.reverted;
      })

    });

    describe('test: updateDistribution', () => {

      const merkleRoot = ethers.utils.formatBytes32String("MERKLE_ROOT");
      const distributionMetaPtr = { protocol: 1, pointer: "bafybeiaoakfoxjwi2kwh43djbmomroiryvhv5cetg74fbtzwef7hzzvrnq" };

      const encodedDistribution = encodeMerkleUpdateDistributionParameters([
        merkleRoot,
        distributionMetaPtr
      ])

      beforeEach(async () => {

        let _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        // Deploy voting strategy
        votingStrategy = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
        // Deploy PayoutStrategy contract
        payoutStrategy = <MerklePayoutStrategy>await deployContract(user, payoutStrategyArtifact, []);

        let params = [
          votingStrategy.address, // _votingStrategyAddress
          payoutStrategy.address, //_payoutStrategyAddress
          _currentBlockTimestamp + 100, // _applicationsStartTime
          _currentBlockTimestamp + 250, // _applicationsEndTime
          _currentBlockTimestamp + 500, // _roundStartTime
          _currentBlockTimestamp + 1000, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRoles, // _adminRoles
          [user.address] // _roundOperators
        ];

        await roundImplementation.initialize(encodeRoundParameters(params));
      });

      it('invoking updateDistribution SHOULD revert WHEN invoked by wallet who is not round operator', async () => {

        const [_, anotherUser] = await ethers.getSigners();

        const txn = roundImplementation.connect(anotherUser).updateDistribution(encodedDistribution);
        await expect(txn).to.be.revertedWith(
          `AccessControl: account ${anotherUser.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );
      });

      it('invoking updateDistribution SHOULD by round operator should not revert', async () => {
        const txn = roundImplementation.updateDistribution(encodedDistribution);
        await expect(txn).to.not.be.reverted;
      });

    });
  })

});
