import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { BigNumberish, Wallet } from "ethers";
import { isAddress } from "ethers/lib/utils";
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
  let _applicationStartTime: BigNumberish;
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
      _roundStartTime = Math.round(new Date().getTime() / 1000 + 3600); // 1 hour later
      _applicationStartTime = Math.round(new Date().getTime() / 1000 + 172800); // 2 days later
      _roundEndTime = Math.round(new Date().getTime() / 1000 + 864000); // 10 days later

      _token = Wallet.createRandom().address;
      _votingStrategy = Wallet.createRandom().address;
      _roundMetaPtr = { protocol: 1, pointer: "bafybeia4khbew3r2mkflyn7nzlvfzcb3qpfeftz5ivpzfwn77ollj47gqi" };
      _applicationMetaPtr = { protocol: 1, pointer: "bafybeiaoakfoxjwi2kwh43djbmomroiryvhv5cetg74fbtzwef7hzzvrnq" };
      _adminRole = Wallet.createRandom().address;
      _roundOperators = [Wallet.createRandom().address, Wallet.createRandom().address];
    })

    beforeEach(async () => {
      // Deploy RoundImplementation contract
      roundImplementationArtifact = await artifacts.readArtifact('RoundImplementation');
      roundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);
    });

    describe('test: initialize', () => {

      it ('default values MUST match the arguments while invoking initialize', async () => {

        const initializeTxn = await roundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _applicationStartTime, // _applicationsStartTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRole, // _adminRole
          _roundOperators // _roundOperators
        );

        initializeTxn.wait();

        // check roles
        expect(await roundImplementation.ROUND_OPERATOR_ROLE()).equals(ROUND_OPERATOR_ROLE);
        expect(await roundImplementation.DEFAULT_ADMIN_ROLE()).equals(DEFAULT_ADMIN_ROLE);

        expect(await roundImplementation.votingStrategy()).equals(_votingStrategy);
        expect(await roundImplementation.applicationsStartTime()).equals(_applicationStartTime);
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


      it ('initialize CANNOT not be called on already initialized contract ', async () => {

        const initializeTxn = await roundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _applicationStartTime, // _applicationsStartTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRole, // _adminRole
          _roundOperators // _roundOperators
        );

        await initializeTxn.wait();

        await expect(roundImplementation.initialize(
          _votingStrategy, // _votingStrategyAddress
          _applicationStartTime, // _applicationsStartTime
          _roundStartTime, // _roundStartTime
          _roundEndTime, // _roundEndTime
          _token, // _token
          _roundMetaPtr, // _roundMetaPtr
          _applicationMetaPtr, // _applicationMetaPtr
          _adminRole, // _adminRole
          _roundOperators // _roundOperators
        )).to.be.revertedWith("Initializable: contract is already initialized");

      });

    });

  })

});
