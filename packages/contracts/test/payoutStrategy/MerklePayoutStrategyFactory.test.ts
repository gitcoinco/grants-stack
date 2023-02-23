import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { isAddress } from "ethers/lib/utils";
import { AddressZero } from "@ethersproject/constants";
import { artifacts, ethers, upgrades } from "hardhat";
import { Artifact } from "hardhat/types";
import { MerklePayoutStrategyFactory, MerklePayoutStrategyFactory__factory, MerklePayoutStrategyImplementation } from "../../typechain";

describe("MerklePayoutStrategyFactory", function () {

  let user: SignerWithAddress;

  // MerklePayoutStrategy Factory
  let MerklePayoutStrategyFactory: MerklePayoutStrategyFactory;
  let MerklePayoutStrategyContractFactory: MerklePayoutStrategyFactory__factory;

  // MerklePayoutStrategy Implementation 
  let MerklePayoutStrategyImplementation: MerklePayoutStrategyImplementation;
  let MerklePayoutStrategyImplementationArtifact: Artifact;


  describe('constructor', () => {

    it('MerklePayoutStrategyFactory SHOULD deploy properly', async () => {

      [user] = await ethers.getSigners();

      MerklePayoutStrategyContractFactory = await ethers.getContractFactory('MerklePayoutStrategyFactory');
      MerklePayoutStrategyFactory = <MerklePayoutStrategyFactory>await upgrades.deployProxy(MerklePayoutStrategyContractFactory);

      // Verify deploy
      expect(isAddress(MerklePayoutStrategyFactory.address), 'Failed to deploy MerklePayoutStrategyFactory').to.be.true;
    });
  })


  describe('core functions', () => {

    beforeEach(async () => {
      [user] = await ethers.getSigners();

      // Deploy MerklePayoutStrategyFactory contract
      MerklePayoutStrategyContractFactory = await ethers.getContractFactory('MerklePayoutStrategyFactory');
      MerklePayoutStrategyFactory = <MerklePayoutStrategyFactory>await upgrades.deployProxy(MerklePayoutStrategyContractFactory);

      // Deploy MerklePayoutStrategyImplementation contract
      MerklePayoutStrategyImplementationArtifact = await artifacts.readArtifact('MerklePayoutStrategyImplementation');
      MerklePayoutStrategyImplementation = <MerklePayoutStrategyImplementation>await deployContract(user, MerklePayoutStrategyImplementationArtifact, []);

    });


    describe('test: updatePayoutImplementation', async () => {

      it("SHOULD have default address after deploy ", async () => {
        expect(await MerklePayoutStrategyFactory.payoutImplementation())
          .to.be.equal(AddressZero);
      });

      it("SHOULD emit PayoutImplementationUpdated event after invoking updatePayoutImplementation", async () => {
        await expect(MerklePayoutStrategyFactory.updatePayoutImplementation(MerklePayoutStrategyImplementation.address))
          .to.emit(MerklePayoutStrategyFactory, 'PayoutImplementationUpdated')
          .withArgs(MerklePayoutStrategyImplementation.address);
      });

      it("SHOULD have payout contract address after invoking updatePayoutImplementation", async () => {
        await MerklePayoutStrategyFactory.updatePayoutImplementation(MerklePayoutStrategyImplementation.address).then(async () => {
          const payoutImplementation = await MerklePayoutStrategyFactory.payoutImplementation();
          expect(payoutImplementation).to.be.equal(MerklePayoutStrategyImplementation.address);
        });

      });
    });

    describe('test: create', async () => {
              
      it("invoking create SHOULD have a successful transaction", async () => {

        const txn = await MerklePayoutStrategyFactory.create();

        await expect(MerklePayoutStrategyFactory.updatePayoutImplementation(MerklePayoutStrategyImplementation.address))

        const receipt = await txn.wait();

        expect(txn.hash).to.not.be.empty;
        expect(receipt.status).equals(1);
      });

      
      it("SHOULD emit PayoutContractCreated event after invoking create", async () => {

        const txn = await MerklePayoutStrategyFactory.create();
        
        const receipt = await txn.wait();

        let payoutContractAddress;
        let payoutImplementation;
        
        if (receipt.events) {
          const event = receipt.events.find(e => e.event === 'PayoutContractCreated');
          if (event && event.args) {            
            
            payoutContractAddress = event.args.payoutContractAddress;
            payoutImplementation = event.args.payoutImplementation;
          }
        }

        expect(txn)
          .to.emit(MerklePayoutStrategyFactory, 'PayoutContractCreated')
          .withArgs(payoutContractAddress, payoutImplementation);

        await expect(isAddress(payoutContractAddress)).to.be.true;
        await expect(isAddress(payoutImplementation)).to.be.true;

      });

    });
  
  });

});