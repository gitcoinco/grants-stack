import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { isAddress } from "ethers/lib/utils";
import { AddressZero } from "@ethersproject/constants";
import { artifacts, ethers, upgrades } from "hardhat";
import { Artifact } from "hardhat/types";
import { QuadraticFundingVotingStrategyFactory, QuadraticFundingVotingStrategyFactory__factory, QuadraticFundingVotingStrategyImplementation } from "../../typechain";

describe("QuadraticFundingVotingStrategyFactory", function () {

  let user: SignerWithAddress;

  // QuadraticFundingVotingStrategy Factory
  let quadraticFundingVotingStrategyFactory: QuadraticFundingVotingStrategyFactory;
  let quadraticFundingVotingStrategyContractFactory: QuadraticFundingVotingStrategyFactory__factory;

  // QuadraticFundingVotingStrategy Implementation 
  let quadraticFundingVotingStrategyImplementation: QuadraticFundingVotingStrategyImplementation;
  let quadraticFundingVotingStrategyImplementationArtifact: Artifact;


  describe('constructor', () => {

    it('QuadraticFundingVotingStrategyFactory SHOULD deploy properly', async () => {

      [user] = await ethers.getSigners();

      quadraticFundingVotingStrategyContractFactory = await ethers.getContractFactory('QuadraticFundingVotingStrategyFactory');
      quadraticFundingVotingStrategyFactory = <QuadraticFundingVotingStrategyFactory>await upgrades.deployProxy(quadraticFundingVotingStrategyContractFactory);

      // Verify deploy
      expect(isAddress(quadraticFundingVotingStrategyFactory.address), 'Failed to deploy QuadraticFundingVotingStrategyFactory').to.be.true;
    });
  })


  describe('core functions', () => {

    beforeEach(async () => {
      [user] = await ethers.getSigners();

      // Deploy QuadraticFundingVotingStrategyFactory contract
      quadraticFundingVotingStrategyContractFactory = await ethers.getContractFactory('QuadraticFundingVotingStrategyFactory');
      quadraticFundingVotingStrategyFactory = <QuadraticFundingVotingStrategyFactory>await upgrades.deployProxy(quadraticFundingVotingStrategyContractFactory);

      // Deploy QuadraticFundingVotingStrategyImplementation contract
      quadraticFundingVotingStrategyImplementationArtifact = await artifacts.readArtifact('QuadraticFundingVotingStrategyImplementation');
      quadraticFundingVotingStrategyImplementation = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, quadraticFundingVotingStrategyImplementationArtifact, []);

    });


    describe('test: updateVotingContract', async () => {

      it("QFcontract SHOULD have default address after deploy ", async () => {
        expect(await quadraticFundingVotingStrategyFactory.votingContract())
          .to.be.equal(AddressZero);
      });

      it("QFcontract SHOULD emit VotingContractUpdated event after invoking updateVotingContract", async () => {
        await expect(quadraticFundingVotingStrategyFactory.updateVotingContract(quadraticFundingVotingStrategyImplementation.address))
          .to.emit(quadraticFundingVotingStrategyFactory, 'VotingContractUpdated')
          .withArgs(quadraticFundingVotingStrategyImplementation.address);
      });

      it("QFcontract SHOULD have voting contract address after invoking updateVotingContract", async () => {
        await quadraticFundingVotingStrategyFactory.updateVotingContract(quadraticFundingVotingStrategyImplementation.address).then(async () => {
          const votingContract = await quadraticFundingVotingStrategyFactory.votingContract();
          expect(votingContract).to.be.equal(quadraticFundingVotingStrategyImplementation.address);
        });

      });
    });

    describe('test: create', async () => {
              
      it("invoking create SHOULD have a successful transaction", async () => {

        const txn = await quadraticFundingVotingStrategyFactory.create();

        await expect(quadraticFundingVotingStrategyFactory.updateVotingContract(quadraticFundingVotingStrategyImplementation.address))

        const receipt = await txn.wait();

        expect(txn.hash).to.not.be.empty;
        expect(receipt.status).equals(1);
      });

      
      it("SHOULD emit VotingContractCreated event after invoking create", async () => {

        const txn = await quadraticFundingVotingStrategyFactory.create();
        
        const receipt = await txn.wait();

        let votingContractAddress;
        let votingImplementation;
        
        if (receipt.events) {
          const event = receipt.events.find(e => e.event === 'VotingContractCreated');
          if (event && event.args) {            
            
            votingContractAddress = event.args.votingContractAddress;
            votingImplementation = event.args.votingImplementation;
          }
        }

        expect(txn)
          .to.emit(quadraticFundingVotingStrategyFactory, 'VotingContractCreated')
          .withArgs(votingContractAddress, votingImplementation);

        await expect(isAddress(votingContractAddress)).to.be.true;
        await expect(isAddress(votingImplementation)).to.be.true;

      });

    });
  
  });

});