import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { isAddress } from "ethers/lib/utils";
import { AddressZero } from "@ethersproject/constants";
import { artifacts, ethers, upgrades } from "hardhat";
import { Artifact } from "hardhat/types";
import {
  QuadraticFundingRelayStrategyFactory,
  QuadraticFundingRelayStrategyFactory__factory,
  QuadraticFundingRelayStrategyImplementation,
} from "../../typechain";

describe.only("QuadraticFundingRelayStrategyFactory", function () {
  let user: SignerWithAddress;

  // QuadraticFundingVotingStrategy Factory
  let quadraticFundingRelayStrategyFactory: QuadraticFundingRelayStrategyFactory;
  // eslint-disable-next-line camelcase
  let quadraticFundingRelayStrategyContractFactory: QuadraticFundingRelayStrategyFactory__factory;

  // QuadraticFundingVotingStrategy Implementation
  let quadraticFundingRelaytrategyImplementation: QuadraticFundingRelayStrategyImplementation;
  let quadraticFundingRelayStrategyImplementationArtifact: Artifact;

  describe("constructor", () => {
    it("QuadraticFundingRelayStrategyFactory SHOULD deploy properly", async () => {
      [user] = await ethers.getSigners();

      quadraticFundingRelayStrategyContractFactory =
        await ethers.getContractFactory("QuadraticFundingRelayStrategyFactory");
      quadraticFundingRelayStrategyFactory = <
        QuadraticFundingRelayStrategyFactory
      >await upgrades.deployProxy(quadraticFundingRelayStrategyContractFactory);

      // Verify deploy
      expect(
        isAddress(quadraticFundingRelayStrategyFactory.address),
        "Failed to deploy QuadraticFundingRelayStrategyFactory"
      ).to.eq(true);
    });
  });

  describe("core functions", () => {
    beforeEach(async () => {
      [user] = await ethers.getSigners();

      // Deploy QuadraticFundingRelayStrategyFactory contract
      quadraticFundingRelayStrategyContractFactory =
        await ethers.getContractFactory("QuadraticFundingRelayStrategyFactory");
      quadraticFundingRelayStrategyFactory = <
        QuadraticFundingRelayStrategyFactory
      >await upgrades.deployProxy(quadraticFundingRelayStrategyContractFactory);

      // Deploy quadraticFundingRelaytrategyImplementation contract
      quadraticFundingRelayStrategyImplementationArtifact =
        await artifacts.readArtifact(
          "QuadraticFundingRelayStrategyImplementation"
        );
      quadraticFundingRelaytrategyImplementation = <
        QuadraticFundingRelayStrategyImplementation
      >await deployContract(
        user,
        quadraticFundingRelayStrategyImplementationArtifact,
        []
      );
    });

    describe("test: updateVotingContract", async () => {
      it("QFcontract SHOULD have default address after deploy ", async () => {
        expect(
          await quadraticFundingRelayStrategyFactory.votingContract()
        ).to.be.equal(AddressZero);
      });

      it("QFcontract SHOULD emit VotingContractUpdated event after invoking updateVotingContract", async () => {
        await expect(
          quadraticFundingRelayStrategyFactory.updateVotingContract(
            quadraticFundingRelaytrategyImplementation.address
          )
        )
          .to.emit(
            quadraticFundingRelayStrategyFactory,
            "VotingContractUpdated"
          )
          .withArgs(quadraticFundingRelaytrategyImplementation.address);
      });

      it("QFcontract SHOULD have voting contract address after invoking updateVotingContract", async () => {
        await quadraticFundingRelayStrategyFactory
          .updateVotingContract(
            quadraticFundingRelaytrategyImplementation.address
          )
          .then(async () => {
            const votingContract =
              await quadraticFundingRelayStrategyFactory.votingContract();
            expect(votingContract).to.be.equal(
              quadraticFundingRelaytrategyImplementation.address
            );
          });
      });
    });

    describe("test: create", async () => {
      it("invoking create SHOULD have a successful transaction", async () => {
        const txn = await quadraticFundingRelayStrategyFactory.create();

        await expect(
          quadraticFundingRelayStrategyFactory.updateVotingContract(
            quadraticFundingRelaytrategyImplementation.address
          )
        ).to.not.be.reverted;

        const receipt = await txn.wait();

        assert.isNotEmpty(txn.hash);
        expect(receipt.status).equals(1);
      });

      it("SHOULD emit VotingContractCreated event after invoking create", async () => {
        const txn = await quadraticFundingRelayStrategyFactory.create();

        const receipt = await txn.wait();

        let votingContractAddress;
        let votingImplementation;

        if (receipt.events) {
          const event = receipt.events.find(
            (e) => e.event === "VotingContractCreated"
          );
          if (event && event.args) {
            votingContractAddress = event.args.votingContractAddress;
            votingImplementation = event.args.votingImplementation;
          }
        }

        expect(txn)
          .to.emit(
            quadraticFundingRelayStrategyFactory,
            "VotingContractCreated"
          )
          .withArgs(votingContractAddress, votingImplementation);

        expect(isAddress(votingContractAddress)).to.eq(true);
        expect(isAddress(votingImplementation)).to.eq(true);
      });
    });
  });
});
