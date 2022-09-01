import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { isAddress } from "ethers/lib/utils";
import { Wallet } from "ethers";
import { AddressZero } from "@ethersproject/constants";
import { artifacts, ethers, upgrades } from "hardhat";
import { Artifact } from "hardhat/types";
import { ProgramFactory, ProgramFactory__factory, ProgramImplementation } from "../../typechain/";
import { encodeProgramParameters } from "../../scripts/utils";

describe("ProgramFactory", function () {

  let user: SignerWithAddress;

  // Program Factory
  let programFactory: ProgramFactory;
  let programContractFactory: ProgramFactory__factory;

  // Program Implementation 
  let programImplementation: ProgramImplementation;
  let programImplementationArtifact: Artifact;


  describe('constructor', () => {

    it('ProgramFactory SHOULD deploy properly', async () => {

      [user] = await ethers.getSigners();

      programContractFactory = await ethers.getContractFactory('ProgramFactory');
      programFactory = <ProgramFactory>await upgrades.deployProxy(programContractFactory);

      // Verify deploy
      expect(isAddress(programFactory.address), 'Failed to deploy ProgramFactory').to.be.true;
    });
  })


  describe('core functions', () => {

    beforeEach(async () => {
      [user] = await ethers.getSigners();

      // Deploy ProgramFactory contract
      programContractFactory = await ethers.getContractFactory('ProgramFactory');
      programFactory = <ProgramFactory>await upgrades.deployProxy(programContractFactory);

      // Deploy ProgramImplementation contract
      programImplementationArtifact = await artifacts.readArtifact('ProgramImplementation');
      programImplementation = <ProgramImplementation>await deployContract(user, programImplementationArtifact, []);

    });


    describe('test: updateProgramContract', async () => {

      it("ProgramContract SHOULD have default address after deploy ", async () => {
        expect(await programFactory.programContract())
          .to.be.equal(AddressZero);
      });

      it("ProgramContract SHOULD emit ProgramContractUpdated event after invoking updateProgramContract", async () => {
        await expect(programFactory.updateProgramContract(programImplementation.address))
          .to.emit(programFactory, 'ProgramContractUpdated')
          .withArgs(programImplementation.address);
      });

      it("ProgramContract SHOULD have program address after invoking updateProgramContract", async () => {
        await programFactory.updateProgramContract(programImplementation.address).then(async () => {
          const programContract = await programFactory.programContract();
          expect(programContract).to.be.equal(programImplementation.address);
        });

      });
    });

    describe('test: create', async () => {
              
      it("invoking create SHOULD have a successful transaction", async() => {

        const params = [
          { protocol: 1, pointer: "bafybeif43xtcb7zfd6lx7rfq42wjvpkbqgoo7qxrczbj4j4iwfl5aaqv2q" }, // _metaPtr
          [ Wallet.createRandom().address ], // _adminRoles
          [ Wallet.createRandom().address, Wallet.createRandom().address ] // _programOperators
        ];

        const txn = await programFactory.create(
          encodeProgramParameters(params),
        );

        const receipt = await txn.wait();

        expect(txn.hash).to.not.be.empty;
        expect(receipt.status).equals(1);
      });

      
      it("SHOULD emit ProgramCreated event after invoking create", async () => {

        const params = [
          { protocol: 1, pointer: "bafybeif43xtcb7zfd6lx7rfq42wjvpkbqgoo7qxrczbj4j4iwfl5aaqv2q" }, // _metaPtr
          [ Wallet.createRandom().address ], // _adminRoles
          [ Wallet.createRandom().address, Wallet.createRandom().address ] // _programOperators
        ];

        const txn = await programFactory.create(
          encodeProgramParameters(params)
        );

        let programAddress;
        let programImplementation;

        const receipt = await txn.wait();
        if (receipt.events) {
          const event = receipt.events.find(e => e.event === 'ProgramCreated');
          if (event && event.args) {
            programAddress = event.args.programContractAddress;
            programImplementation = event.args.programImplementation;
          }
        }

        expect(txn)
          .to.emit(programFactory, 'ProgramCreated')
          .withArgs(programAddress, programImplementation);

        expect(isAddress(programAddress)).to.be.true;
        expect(isAddress(programImplementation)).to.be.true;

      });

    });
  
  });

});