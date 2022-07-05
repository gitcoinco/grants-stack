import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { BigNumberish, ContractTransaction, Wallet } from "ethers";
import { BytesLike, isAddress } from "ethers/lib/utils";
import { artifacts, ethers } from "hardhat";
import { Artifact } from "hardhat/types";
import { BulkVotingStrategy, RoundFactory, RoundImplementation } from "../../typechain";


type MetaPtr = {
  protocol: BigNumberish;
  pointer: string;
}

describe("RoundImplementation", function () {

  let user: SignerWithAddress;

  // Round Factory
  let roundFactory: RoundFactory;
  let roundFactoryArtifact: Artifact;

  // Round Implementation
  let roundImplementation: RoundImplementation;
  let roundImplementationArtifact: Artifact;

  // Voting Strategy
  let votingStrategy: BulkVotingStrategy;
  let votingStrategyArtifact: Artifact;

  // Variable declarations
  let _roundStartTime: BigNumberish;
  let _applicationsStartTime: BigNumberish;
  let _applicationsEndTime: BigNumberish;
  let _roundEndTime: BigNumberish;
  let _token: string;
  let _votingStrategy: string;
  let _roundMetaPtr: MetaPtr;
  let _applicationMetaPtr: MetaPtr;
  let _adminRole: string;
  let _roundOperators: string[];

  const ROUND_OPERATOR_ROLE = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("ROUND_OPERATOR")
  );

  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

  before(async () => {
    [user] = await ethers.getSigners();

    // Deploy VotingStrategy contract
    votingStrategyArtifact = await artifacts.readArtifact('BulkVotingStrategy');
    votingStrategy = <BulkVotingStrategy>await deployContract(user, votingStrategyArtifact, []);
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
      _roundMetaPtr = { protocol: 1, pointer: "bafybeia4khbew3r2mkflyn7nzlvfzcb3qpfeftz5ivpzfwn77ollj47gqi" };
      _applicationMetaPtr = { protocol: 1, pointer: "bafybeiaoakfoxjwi2kwh43djbmomroiryvhv5cetg74fbtzwef7hzzvrnq" };
      _adminRole = user.address;
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

      let initializeTxn: ContractTransaction;

      beforeEach(async () => {
        initializeTxn = await roundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _applicationsStartTime, // _applicationsStartTime
          _applicationsEndTime, // _applicationsEndTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRole, // _adminRole
          _roundOperators // _roundOperators
        );

        initializeTxn.wait();
      })


      it ('default values MUST match the arguments while invoking initialize', async () => {

        // check roles
        expect(await roundImplementation.ROUND_OPERATOR_ROLE()).equals(ROUND_OPERATOR_ROLE);
        expect(await roundImplementation.DEFAULT_ADMIN_ROLE()).equals(DEFAULT_ADMIN_ROLE);

        expect(await roundImplementation.votingStrategy()).equals(_votingStrategy);
        expect(await roundImplementation.applicationsStartTime()).equals(_applicationsStartTime);
        expect(await roundImplementation.applicationsEndTime()).equals(_applicationsEndTime);
        expect(await roundImplementation.roundStartTime()).equals(_roundStartTime);
        expect(await roundImplementation.roundEndTime()).equals(_roundEndTime);
        expect(await roundImplementation.token()).equals(_token);

        const roundMetaPtr = await roundImplementation.roundMetaPtr();
        expect(roundMetaPtr.pointer).equals(_roundMetaPtr.pointer);
        expect(roundMetaPtr.protocol).equals(_roundMetaPtr.protocol);

        const applicationMetaPtr = await roundImplementation.applicationMetaPtr();
        expect(applicationMetaPtr.pointer).equals(_applicationMetaPtr.pointer);
        expect(applicationMetaPtr.protocol).equals(_applicationMetaPtr.protocol);

        expect(await roundImplementation.getRoleMemberCount(ROUND_OPERATOR_ROLE)).equals(_roundOperators.length);
        expect(await roundImplementation.getRoleMember(ROUND_OPERATOR_ROLE, 0)).equals(_roundOperators[0]);
        expect(await roundImplementation.getRoleMember(ROUND_OPERATOR_ROLE, 1)).equals(_roundOperators[1]);
      });


      it ('initialize SHOULD revert when applicationsStartTime is in the past', async () => {

        const _time = Math.round(new Date().getTime() / 1000 - 259200); // 3 days earlier
        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        await expect(newRoundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _time, // _applicationsStartTime
          _applicationsEndTime, // _applicationsEndTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRole, // _adminRole
          _roundOperators // _roundOperators
        )).to.be.revertedWith("initialize: applications start time has already passed");

      });


      it ('initialize SHOULD revert when applicationsStartTime is after applicationsEndTime', async () => {

        const _time = Math.round(new Date().getTime() / 1000 - 259200); // 3 days earlier
        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        await expect(newRoundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _applicationsStartTime, // _applicationsStartTime
          _time, // _applicationsEndTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRole, // _adminRole
          _roundOperators // _roundOperators
        )).to.be.revertedWith("initialize: application end time should be after application start time");

      });

      it ('initialize SHOULD revert if applicationsEndTime is after roundEndTime', async () => {

        const _time = Math.round(new Date().getTime() / 1000); // current time
        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        await expect(newRoundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _applicationsStartTime, // _applicationsStartTime
          _applicationsEndTime, // _applicationsEndTime
          _roundStartTime, // _roundStartTime
          _time, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRole, // _adminRole
          _roundOperators // _roundOperators
        )).to.be.revertedWith("initialize: application end time should be before round end time");

      });

      it ('initialize SHOULD revert if roundEndTime is after roundStartTime', async () => {

        const _uApplicationsStartTime = Math.round(new Date().getTime() / 1000 + 3600); // 1 hour later
        const _uApplicationsEndTime = Math.round(new Date().getTime() / 1000 + 7200); // 2 hours later
        const _uRoundStartTime = Math.round(new Date().getTime() / 1000 + 14400); // 4 hours later
        const _uRoundEndTime = Math.round(new Date().getTime() / 1000 + 10800); // 3 hours later

        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        await expect(newRoundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _uApplicationsStartTime, // _applicationsStartTime
          _uApplicationsEndTime, // _applicationsEndTime
          _uRoundStartTime, // _roundStartTime
          _uRoundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRole, // _adminRole
          _roundOperators // _roundOperators
        )).to.be.revertedWith("initialize: end time should be after start time");

      });


      it ('initialize SHOULD revert when applicationsStartTime is after roundStartTime', async () => {

        const _uApplicationsStartTime = Math.round(new Date().getTime() / 1000 + 3600); // 1 hour later
        const _uApplicationsEndTime = Math.round(new Date().getTime() / 1000 + 7200); // 2 hours later
        const _uRoundStartTime = Math.round(new Date().getTime() / 1000 + 1800); // 30 min later
        const _uRoundEndTime = Math.round(new Date().getTime() / 1000 + 14000); // 4 hours later

        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        await expect(newRoundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _uApplicationsStartTime, // _applicationsStartTime
          _uApplicationsEndTime, // _applicationsEndTime
          _uRoundStartTime, // _roundStartTime
          _uRoundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRole, // _adminRole
          _roundOperators // _roundOperators
        )).to.be.revertedWith("initialize: round start time should be after application start time");

      });

      it ('initialize CANNOT not be invoked on already initialized contract ', async () => {

        await expect(roundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _applicationsStartTime, // _applicationsStartTime
          _applicationsEndTime, // _applicationsEndTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRole, // _adminRole
          _roundOperators // _roundOperators
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

      const randomMetaPtr: MetaPtr = {
        protocol: 1,
        pointer: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
      };

      let initializeTxn: ContractTransaction;

      beforeEach(async () => {
        initializeTxn = await roundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _applicationsStartTime, // _applicationsStartTime
          _applicationsEndTime, // _applicationsEndTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRole, // _adminRole
          _roundOperators // _roundOperators
        );

        initializeTxn.wait();
      });

      it ('updateRoundMetaPtr SHOULD revert if invoked by wallet who is not round operator', async () => {

        const randomWallet = Wallet.createRandom().address;

        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        const txn = await newRoundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _applicationsStartTime, // _applicationsStartTime
          _applicationsEndTime, // _applicationsEndTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          randomWallet, // _adminRole
          [randomWallet] // _roundOperators
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
    });

    describe('test: updateApplicationMetaPtr', () => {

      const randomMetaPtr: MetaPtr = {
        protocol: 1,
        pointer: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
      };

      let initializeTxn: ContractTransaction;

      beforeEach(async () => {
        initializeTxn = await roundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _applicationsStartTime, // _applicationsStartTime
          _applicationsEndTime, // _applicationsEndTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRole, // _adminRole
          _roundOperators // _roundOperators
        );

        initializeTxn.wait();
      });

      it ('updateApplicationMetaPtr SHOULD revert if invoked by wallet who is not round operator', async () => {

        const randomWallet = Wallet.createRandom().address;
        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        const txn = await newRoundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _applicationsStartTime, // _applicationsStartTime
          _applicationsEndTime, // _applicationsEndTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          randomWallet, // _adminRole
          [randomWallet] // _roundOperators
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
    });


    describe('test: updateRoundStartTime', () => {

      let initializeTxn: ContractTransaction;

      const newTime = Math.round(new Date().getTime() / 1000 + 7200); // 2 hours later

      beforeEach(async () => {

        initializeTxn = await roundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _applicationsStartTime, // _applicationsStartTime
          _applicationsEndTime, // _applicationsEndTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRole, // _adminRole
          _roundOperators // _roundOperators
        );

        initializeTxn.wait();
      });

      it ('invoking updateRoundStartTime SHOULD revert if invoked by wallet who is not round operator', async () => {

        const randomWallet = Wallet.createRandom().address;
        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        const txn = await newRoundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _applicationsStartTime, // _applicationsStartTime
          _applicationsEndTime, // _applicationsEndTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          randomWallet, // _adminRole
          [randomWallet] // _roundOperators
        );

        txn.wait();

        await expect(newRoundImplementation.updateRoundStartTime(newTime)).to.revertedWith(
          `AccessControl: account ${user.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );
      });


      it ('invoking updateRoundStartTime SHOULD revert if roundStartTime is in past', async () => {

        const _time = Math.round(new Date().getTime() / 1000 - 1800); // 30 min before

        await expect(roundImplementation.updateRoundStartTime(_time)).to.revertedWith(
          'updateRoundStartTime: start time has already passed'
        );
      });

      it ('invoking updateRoundStartTime SHOULD revert if roundStartTime is before applicationsStartTime', async () => {

        const _time = Math.round(new Date().getTime() / 1000 + 1800); // 30 min later

        await expect(roundImplementation.updateRoundStartTime(_time)).to.revertedWith(
          'updateRoundStartTime: start time should be after application start time'
        );
      });

      it ('invoking updateRoundStartTime SHOULD revert if roundStartTime is after roundEndTime', async () => {

        const _time = Math.round(new Date().getTime() / 1000 + 18000); // 5 hours later

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
          .withArgs(_roundStartTime, newTime);
      });

    });

    describe('test: updateRoundEndTime', () => {
      let initializeTxn: ContractTransaction;

      const newTime = Math.round(new Date().getTime() / 1000 + 691200); // 8 days later

      const _uApplicationsStartTime = Math.round(new Date().getTime() / 1000 + 3600); // 1 hour later
      const _uApplicationsEndTime = Math.round(new Date().getTime() / 1000 + 10800); // 3 hours later
      const _uRoundStartTime = Math.round(new Date().getTime() / 1000 + 7200); // 2 hours later
      const _uRoundEndTime = Math.round(new Date().getTime() / 1000 + 14400); // 4 hours later

      beforeEach(async () => {

        initializeTxn = await roundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _uApplicationsStartTime, // _applicationsStartTime
          _uApplicationsEndTime, // _applicationsEndTime
          _uRoundStartTime, // _roundStartTime
          _uRoundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRole, // _adminRole
          _roundOperators // _roundOperators
        );

        initializeTxn.wait();
      });

      it ('invoking updateRoundEndTime SHOULD revert if invoked by wallet who is not round operator', async () => {

        const randomWallet = Wallet.createRandom().address;
        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        const txn = await newRoundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _applicationsStartTime, // _applicationsStartTime
          _applicationsEndTime, // _applicationsEndTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          randomWallet, // _adminRole
          [randomWallet] // _roundOperators
        );

        txn.wait();

        await expect(newRoundImplementation.updateRoundEndTime(newTime)).to.revertedWith(
          `AccessControl: account ${user.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );
      });

      it ('invoking updateRoundEndTime SHOULD revert if roundEndTime is in the past', async () => {

        const _time = Math.round(new Date().getTime() / 1000 - 3600); // 1 hour earlier

        await expect(roundImplementation.updateRoundEndTime(_time)).to.revertedWith(
          'updateRoundEndTime: end time has already passed'
        );
      });

      it ('invoking updateRoundEndTime SHOULD revert if roundEndTime is after roundStartTime', async () => {

        const _time = Math.round(new Date().getTime() / 1000 + 900); // 15 min later

        await expect(roundImplementation.updateRoundEndTime(_time)).to.revertedWith(
          'updateRoundEndTime: end time should be after start time'
        );
      });

      it ('invoking updateRoundEndTime SHOULD revert if roundEndTime is before applicationsEndTime', async () => {

        const _time = _applicationsEndTime; // 2.5 hours later

        await expect(roundImplementation.updateRoundEndTime(_time)).to.revertedWith(
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
          .withArgs(_uRoundEndTime, newTime);
      });
    });

    describe('test: updateApplicationsStartTime', () => {
      let initializeTxn: ContractTransaction;

      const newTime = Math.round(new Date().getTime() / 1000 + 7200); // 2 hours later

      beforeEach(async () => {

        initializeTxn = await roundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _applicationsStartTime, // _applicationsStartTime
          _applicationsEndTime, // _applicationsEndTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRole, // _adminRole
          _roundOperators // _roundOperators
        );

        initializeTxn.wait();
      });


      it ('updateApplicationsStartTime SHOULD revert if invoked by wallet who is not round operator', async () => {

        const randomWallet = Wallet.createRandom().address;
        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        const txn = await newRoundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _applicationsStartTime, // _applicationsStartTime
          _applicationsEndTime, // _applicationsEndTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          randomWallet, // _adminRole
          [randomWallet] // _roundOperators
        );

        txn.wait();

        await expect(newRoundImplementation.updateApplicationsStartTime(newTime)).to.revertedWith(
          `AccessControl: account ${user.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );
      });

      it ('invoking updateApplicationsStartTime SHOULD revert if applicationsStartTime is in the past', async () => {

        const _time = Math.round(new Date().getTime() / 1000 - 3600); // 1 hour earlier

        await expect(roundImplementation.updateApplicationsStartTime(_time)).to.revertedWith(
          'updateApplicationsStartTime: application start time has already passed'
        );
      });

      it ('invoking updateApplicationsStartTime SHOULD revert if applicationsStartTime is after roundStartTime', async () => {

        const _time = Math.round(new Date().getTime() / 1000 + 18000); // 5 hours later

        await expect(roundImplementation.updateApplicationsStartTime(_time)).to.revertedWith(
          'updateApplicationsStartTime: should be before round start time'
        );
      });

      it ('invoking updateApplicationsStartTime SHOULD revert if applicationsStartTime is after applicationsEndTime', async () => {

        const _time = Math.round(new Date().getTime() / 1000 + 9000); // 2.5 hours later

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

        expect(await roundImplementation.updateApplicationsStartTime(newTime))
          .to.emit(roundImplementation, 'ApplicationsStartTimeUpdated')
          .withArgs(_applicationsStartTime, newTime);
      });
    });

    describe('test: updateApplicationsEndTime', () => {
      let initializeTxn: ContractTransaction;
    
      const newTime = Math.round(new Date().getTime() / 1000 + 12600); // 3.5 hours later
    
      beforeEach(async () => {
    
        initializeTxn = await roundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _applicationsStartTime, // _applicationsStartTime
          _applicationsEndTime, // _applicationsEndTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRole, // _adminRole
          _roundOperators // _roundOperators
        );
    
        initializeTxn.wait();
      });
    
      it ('invoking updateApplicationsEndTime SHOULD revert if invoked by wallet who is not round operator', async () => {
    
        const randomWallet = Wallet.createRandom().address;
        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);
    
        const txn = await newRoundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _applicationsStartTime, // _applicationsStartTime
          _applicationsEndTime, // _applicationsEndTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          randomWallet, // _adminRole
          [randomWallet] // _roundOperators
        );
    
        txn.wait();
    
        await expect(newRoundImplementation.updateApplicationsEndTime(newTime)).to.revertedWith(
          `AccessControl: account ${user.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );
      });
    
      it ('invoking updateApplicationsEndTime SHOULD revert if applicationsEndTime has already passed', async () => {
    
        const _time = Math.round(new Date().getTime() / 1000 - 900); // 15 min before
    
        await expect(roundImplementation.updateApplicationsEndTime(_time)).to.revertedWith(
          'updateApplicationsEndTime: application end time has already passed'
        );
      });
    
      it ('invoking updateApplicationsEndTime SHOULD revert if applicationsEndTime is before applicationsStartTime', async () => {
    
        const _time = Math.round(new Date().getTime() / 1000 + 900); // 15 min later
    
        await expect(roundImplementation.updateApplicationsEndTime(_time)).to.revertedWith(
          'updateApplicationsEndTime: application end time should be after application start time'
        );
      });
    
      it ('invoking updateApplicationsEndTime SHOULD revert if applicationsEndTime is after roundEndTime', async () => {
    
        const _time = Math.round(new Date().getTime() / 1000 + 16200); // 4.5 hours later
    
        await expect(roundImplementation.updateApplicationsEndTime(_time)).to.revertedWith(
          'updateApplicationsEndTime: should be before round end time'
        );
      });
    
      it ('invoking updateApplicationsEndTime SHOULD update roundEndTime value IF called is round operator', async () => {
    
        const txn = await roundImplementation.updateApplicationsEndTime(newTime);
        await txn.wait();
    
        const applicationsEndTime = await roundImplementation.applicationsEndTime();
        expect(applicationsEndTime).equals(newTime);
      });
    
      it('invoking updateApplicationsEndTime SHOULD emit RoundEndTimeUpdated event', async() => {
    
        expect(await roundImplementation.updateApplicationsEndTime(newTime))
          .to.emit(roundImplementation, 'ApplicationsEndTimeUpdated')
          .withArgs(_applicationsEndTime, newTime);
      });
    });

    describe('test: updateProjectsMetaPtr', () => {

      const randomMetaPtr: MetaPtr = {
        protocol: 1,
        pointer: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
      };

      const defaultPointer = { protocol: 0, pointer: "" };

      let initializeTxn: ContractTransaction;

      beforeEach(async () => {

        initializeTxn = await roundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _applicationsStartTime, // _applicationsStartTime
          _applicationsEndTime, // _applicationsEndTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRole, // _adminRole
          _roundOperators // _roundOperators
        );

        initializeTxn.wait();
      });

      it ('updateProjectsMetaPtr SHOULD revert if invoked by wallet who is not round operator', async () => {

        const randomWallet = Wallet.createRandom().address;
        const newRoundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

        const txn = await newRoundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _applicationsStartTime, // _applicationsStartTime
          _applicationsEndTime, // _applicationsEndTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          randomWallet, // _adminRole
          [randomWallet] // _roundOperators
        );

        txn.wait();

        await expect(newRoundImplementation.updateProjectsMetaPtr(randomMetaPtr)).to.revertedWith(
          `AccessControl: account ${user.address.toLowerCase()} is missing role 0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5`
        );

      });

      it ('invoking updateProjectsMetaPtr SHOULD update roundMetaPtr value IF called is round operator', async () => {

        const txn = await roundImplementation.updateProjectsMetaPtr(randomMetaPtr);
        await txn.wait();

        const projectsMetaPtr = await roundImplementation.projectsMetaPtr();
        expect(projectsMetaPtr.pointer).equals(randomMetaPtr.pointer);
        expect(projectsMetaPtr.protocol).equals(randomMetaPtr.protocol);
      });

      it ('invoking updateProjectsMetaPtr SHOULD emit ProjectsMetaPtrUpdated event', async () => {

        const txn = await roundImplementation.updateProjectsMetaPtr(randomMetaPtr);

        expect(txn)
          .to.emit(roundImplementation, 'ProjectsMetaPtrUpdated')
          .withArgs(
            [ defaultPointer.protocol,  defaultPointer.pointer ],
            [ randomMetaPtr.protocol, randomMetaPtr.pointer ]
          );
      });

    });

    describe('test: applyToRound', () => {
      it('invoking applyToRound SHOULD emit NewProjectApplication event', async() => {
        const project = Wallet.createRandom().address;
        const newProjectMetaPtr: MetaPtr = {
          protocol: 1,
          pointer: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
        };

        const txn = await roundImplementation.applyToRound(project, newProjectMetaPtr);
        expect(txn).to.emit(
          roundImplementation, 'NewProjectApplication'
        ).withArgs(
          project, 
          [ newProjectMetaPtr.protocol, newProjectMetaPtr.pointer ]
        );
      });
    });

    describe('test: vote', () => {
      const votes = [
        [Wallet.createRandom().address, 1, Wallet.createRandom().address],
        [Wallet.createRandom().address, 2, Wallet.createRandom().address]
      ];

      const encodedVotes: BytesLike[] = [];

      for (let i = 0; i < votes.length; i++) {
        encodedVotes.push(ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256", "address"], votes[i]
        ));
      }

      it('invoking Vote with encoded votes SHOULD NOT revert', async () => {
        expect(
          roundImplementation.vote(encodedVotes)
        ).to.not.be.reverted;
      })
    });
  })

});
