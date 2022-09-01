import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { isAddress } from "ethers/lib/utils";
import { Wallet } from "ethers";
import { AddressZero } from "@ethersproject/constants";
import { artifacts, ethers, upgrades } from "hardhat";
import { Artifact } from "hardhat/types";
import { RoundFactory, RoundFactory__factory, RoundImplementation } from "../../typechain/";
import { encodeRoundParameters } from "../../scripts/utils";

describe("RoundFactory", function () {

  let user: SignerWithAddress;

  // Round Factory
  let roundFactory: RoundFactory;
  let roundContractFactory: RoundFactory__factory;

  // Round Implementation 
  let roundImplementation: RoundImplementation;
  let roundImplementationArtifact: Artifact;


  describe('constructor', () => {

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
      [user] = await ethers.getSigners();

      // Deploy RoundFactory contract
      roundContractFactory = await ethers.getContractFactory('RoundFactory');
      roundFactory = <RoundFactory>await upgrades.deployProxy(roundContractFactory);

      // Deploy RoundImplementation contract
      roundImplementationArtifact = await artifacts.readArtifact('RoundImplementation');
      roundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

    });


    describe('test: updateRoundContract', async () => {

      it("RoundContract SHOULD have default address after deploy ", async () => {
        expect(await roundFactory.roundContract())
          .to.be.equal(AddressZero);
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

    describe('test: create', async () => {
      
      const applicationsStartTime = Math.round(new Date().getTime() / 1000 + 3600); // 1 hour later
      const applicationsEndTime = Math.round(new Date().getTime() / 1000 + 7200); // 2 hours later
      const roundStartTime = Math.round(new Date().getTime() / 1000 + 10800); // 3 hours later
      const roundEndTime = Math.round(new Date().getTime() / 1000 + 14400); // 4 hours later

        
      it("invoking create SHOULD have a successful transaction", async() => {

        const params = [
          Wallet.createRandom().address, // _votingStrategyAddress
          applicationsStartTime, // _applicationsStartTime
          applicationsEndTime, // _applicationsEndTime
          roundStartTime, // _roundStartTime
          roundEndTime, // _roundEndTime
          Wallet.createRandom().address, // _token
          { protocol: 1, pointer: "bafybeia4khbew3r2mkflyn7nzlvfzcb3qpfeftz5ivpzfwn77ollj47gqi" }, // _roundMetaPtr
          { protocol: 1, pointer: "bafybeiaoakfoxjwi2kwh43djbmomroiryvhv5cetg74fbtzwef7hzzvrnq" }, // _applicationMetaPtr
          [ Wallet.createRandom().address ], // _adminRoles
          [ Wallet.createRandom().address, Wallet.createRandom().address ] // _roundOperators
        ];

        const txn = await roundFactory.create(
          encodeRoundParameters(params),
          Wallet.createRandom().address, // _ownedBy (Program)
        );

        const receipt = await txn.wait();

        expect(txn.hash).to.not.be.empty;
        expect(receipt.status).equals(1);
      });

      
      it("SHOULD emit RoundCreated event after invoking create", async () => {

        const programAddress = Wallet.createRandom().address;

        const params = [
          Wallet.createRandom().address, // _votingStrategyAddress
          applicationsStartTime, // _applicationsStartTime
          applicationsEndTime, // _applicationsEndTime
          roundStartTime, // _roundStartTime
          roundEndTime, // _roundEndTime
          Wallet.createRandom().address, // _token
          { protocol: 1, pointer: "bafybeia4khbew3r2mkflyn7nzlvfzcb3qpfeftz5ivpzfwn77ollj47gqi" }, // _roundMetaPtr
          { protocol: 1, pointer: "bafybeiaoakfoxjwi2kwh43djbmomroiryvhv5cetg74fbtzwef7hzzvrnq" }, // _applicationMetaPtr
          [ Wallet.createRandom().address ], // _adminRoles
          [ Wallet.createRandom().address, Wallet.createRandom().address ] // _roundOperators
        ];

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