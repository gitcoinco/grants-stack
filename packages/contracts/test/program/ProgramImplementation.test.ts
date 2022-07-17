import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { isAddress } from "ethers/lib/utils";
import { BigNumberish, ContractTransaction, Wallet } from "ethers";
import { artifacts, ethers } from "hardhat";
import { Artifact } from "hardhat/types";
import { ProgramImplementation } from "../../typechain/";
import { encodeProgramParameters } from "../../scripts/utils";

type MetaPtr = {
  protocol: BigNumberish;
  pointer: string;
}

describe("ProgramImplementation", function () {
  let user: SignerWithAddress;

  // Program Implementation
  let programImplementation: ProgramImplementation;
  let programImplementationArtifact: Artifact;

  // Variable declarations
  let _metaPtr: MetaPtr;
  let _adminRoles: string[];
  let _programOperators: string[];

  const PROGRAM_OPERATOR_ROLE = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("PROGRAM_OPERATOR")
  );

  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";


  describe('constructor', () => {
    it('ProgramImplementation SHOULD deploy properly', async () => {
      [user] = await ethers.getSigners();

      programImplementationArtifact = await artifacts.readArtifact('ProgramImplementation');
      programImplementation = <ProgramImplementation>await deployContract(user, programImplementationArtifact, []);

      // Verify deploy
      expect(isAddress(programImplementation.address), 'Failed to deploy ProgramImplementation').to.be.true;
    }
    );
  });

  describe('core functions', () => {

    before(async() => {
      _metaPtr = { protocol: 1, pointer: "bafybeiaoakfoxjwi2kwh43djbmomroiryvhv5cetg74fbtzwef7hzzvrnq" };
      _adminRoles = [ user.address ];
      _programOperators = [
        user.address,
        Wallet.createRandom().address,
        Wallet.createRandom().address
      ];
    })

    beforeEach(async () => {
      [user] = await ethers.getSigners();

      // Deploy ProgramImplementation contract
      programImplementationArtifact = await artifacts.readArtifact('ProgramImplementation');
      programImplementation = <ProgramImplementation>await deployContract(user, programImplementationArtifact, []);
    });

    describe('test: initialize', async () => {
      let initializeTxn: ContractTransaction;

      beforeEach(async () => {

        let params = [
          _metaPtr, // _metaPtr
          _adminRoles,  // _adminRoles
          _programOperators // _programOperators
        ];

        initializeTxn = await programImplementation.initialize(
          encodeProgramParameters(params)
        );

        initializeTxn.wait();
      });

      it ('default values MUST match the arguments while invoking initialize', async () => {
        // check roles
        expect(await programImplementation.PROGRAM_OPERATOR_ROLE()).equals(PROGRAM_OPERATOR_ROLE);
        expect(await programImplementation.DEFAULT_ADMIN_ROLE()).equals(DEFAULT_ADMIN_ROLE);

        const metaPtr = await programImplementation.metaPtr();
        expect(metaPtr.pointer).equals(_metaPtr.pointer);
        expect(metaPtr.protocol).equals(_metaPtr.protocol);

        expect(await programImplementation.getRoleMemberCount(DEFAULT_ADMIN_ROLE)).equals(_adminRoles.length);
        expect(await programImplementation.getRoleMember(DEFAULT_ADMIN_ROLE, 0)).equals(_adminRoles[0]);

        expect(await programImplementation.getRoleMemberCount(PROGRAM_OPERATOR_ROLE)).equals(_programOperators.length);
        expect(await programImplementation.getRoleMember(PROGRAM_OPERATOR_ROLE, 0)).equals(_programOperators[0]);
        expect(await programImplementation.getRoleMember(PROGRAM_OPERATOR_ROLE, 1)).equals(_programOperators[1]);
      });

      it ('initialize CANNOT not be invoked on already initialized contract ', async () => {

        let params = [
          _metaPtr, // _metaPtr
          _adminRoles,  // _adminRoles
          _programOperators // _programOperators
        ];

        await expect(programImplementation.initialize(
          encodeProgramParameters(params)
        )).to.be.revertedWith("Initializable: contract is already initialized");

      });

      it('invoking initialize MUST fire Events', async () => {

        const defaultPointer = { protocol: 0, pointer: "" };

        expect(initializeTxn)
          .to.emit(programImplementation,  'MetaPtrUpdated')
          .withArgs(
            [ defaultPointer.protocol, defaultPointer.pointer ],
            [ _metaPtr.protocol, _metaPtr.pointer ]
          );
      });

    });

    describe('test: updateMetaPtr', async () => {

      const randomMetaPtr: MetaPtr = {
        protocol: 1,
        pointer: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
      };

      let initializeTxn: ContractTransaction;

      beforeEach(async () => {
        let params = [
          _metaPtr, // _metaPtr
          _adminRoles,  // _adminRoles
          _programOperators // _programOperators
        ];

        initializeTxn = await programImplementation.initialize(
          encodeProgramParameters(params)
        );

        initializeTxn.wait();
      });

     
      it ('updateMetaPtr SHOULD revert if invoked by wallet who is not program operator', async () => {
        const randomWallet = Wallet.createRandom().address;

        const newProgramImplementation = <ProgramImplementation>await deployContract(user, programImplementationArtifact, []);

        let params = [
          _metaPtr, // _metaPtr
          [randomWallet],  // _adminRoles
          [randomWallet] // _programOperators
        ];

        const txn = await newProgramImplementation.initialize(
          encodeProgramParameters(params)
        );

        txn.wait();

        await expect(newProgramImplementation.updateMetaPtr(randomMetaPtr)).to.revertedWith(
          `AccessControl: account ${user.address.toLowerCase()} is missing role 0xaa630204f2780b6f080cc77cc0e9c0a5c21e92eb0c6771e709255dd27d6de132`
        );
      });


      it ('invoking updateMetaPtr SHOULD update metaPtr value IF called is program operator', async () => {

        const txn = await programImplementation.updateMetaPtr(randomMetaPtr);
        await txn.wait();

        const metaPtr = await programImplementation.metaPtr();
        expect(metaPtr.pointer).equals(randomMetaPtr.pointer);
        expect(metaPtr.protocol).equals(randomMetaPtr.protocol);
      });

      it ('invoking updateMetaPtr SHOULD emit MetaPtrUpdated event', async () => {

        const txn = await programImplementation.updateMetaPtr(randomMetaPtr);

        expect(txn)
          .to.emit(programImplementation, 'MetaPtrUpdated')
          .withArgs(
            [ _metaPtr.protocol, _metaPtr.pointer ],
            [ randomMetaPtr.protocol, randomMetaPtr.pointer ]
          );
      });
    });
  });
});

