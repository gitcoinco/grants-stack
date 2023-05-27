import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { isAddress } from "ethers/lib/utils";
import { artifacts, ethers } from "hardhat";
import { Artifact } from "hardhat/types";
import {
  MerklePayoutStrategyImplementation,
  MerklePayoutStrategyFactory,
} from "../../typechain";
import { AddressZero } from "@ethersproject/constants";

describe("MerklePayoutStrategyFactory", () => {
  let user: SignerWithAddress;
  let merklePayoutStrategyImplementation: MerklePayoutStrategyImplementation;
  let merklePayoutStrategyImplementationArtifact: Artifact;
  let merklePayoutStrategyFactory: MerklePayoutStrategyFactory;
  let merklePayoutStrategyFactoryArtifact: Artifact;
  describe("constructor", () => {
    it("deploys properly", async () => {
      [user] = await ethers.getSigners();
      merklePayoutStrategyFactoryArtifact = await artifacts.readArtifact(
        "MerklePayoutStrategyFactory"
      );

      merklePayoutStrategyFactory = <MerklePayoutStrategyFactory>(
        await deployContract(user, merklePayoutStrategyFactoryArtifact, [])
      );

      merklePayoutStrategyImplementationArtifact = await artifacts.readArtifact(
        "MerklePayoutStrategyImplementation"
      );
      merklePayoutStrategyImplementation = <MerklePayoutStrategyImplementation>(
        await deployContract(
          user,
          merklePayoutStrategyImplementationArtifact,
          []
        )
      );

      // eslint-disable-next-line no-unused-expressions
      expect(
        isAddress(merklePayoutStrategyFactory.address),
        "failed to deploy merklepayoutfactory"
      ).to.be.true;

      // Verify deploy
      // eslint-disable-next-line no-unused-expressions
      expect(
        isAddress(merklePayoutStrategyImplementation.address),
        "Failed to deploy MerklePayoutStrategy"
      ).to.be.true;

      // Verify default value
      const metaPtr =
        await merklePayoutStrategyImplementation.distributionMetaPtr();
      expect(metaPtr.protocol).to.equal(0);
      // eslint-disable-next-line no-unused-expressions
      expect(metaPtr.pointer).to.be.empty;

      expect(await merklePayoutStrategyImplementation.roundAddress()).to.equal(
        AddressZero
      );
    });
  });

  describe("core functions", () => {
    describe("test: initialize", () => {
      beforeEach(async () => {
        [user] = await ethers.getSigners();
        merklePayoutStrategyFactoryArtifact = await artifacts.readArtifact(
          "MerklePayoutStrategyFactory"
        );

        merklePayoutStrategyFactory = <MerklePayoutStrategyFactory>(
          await deployContract(user, merklePayoutStrategyFactoryArtifact, [])
        );

        merklePayoutStrategyImplementationArtifact =
          await artifacts.readArtifact("MerklePayoutStrategyImplementation");
        merklePayoutStrategyImplementation = <
          MerklePayoutStrategyImplementation
        >await deployContract(
          user,
          merklePayoutStrategyImplementationArtifact,
          []
        );

        // eslint-disable-next-line no-unused-expressions
        expect(
          isAddress(merklePayoutStrategyFactory.address),
          "failed to deploy merklepayoutfactory"
        ).to.be.true;

        // Verify deploy
        // eslint-disable-next-line no-unused-expressions
        expect(
          isAddress(merklePayoutStrategyImplementation.address),
          "Failed to deploy MerklePayoutStrategy"
        ).to.be.true;

        // Verify default value
        const metaPtr =
          await merklePayoutStrategyImplementation.distributionMetaPtr();
        expect(metaPtr.protocol).to.equal(0);
        // eslint-disable-next-line no-unused-expressions
        expect(metaPtr.pointer).to.be.empty;

        expect(
          await merklePayoutStrategyImplementation.roundAddress()
        ).to.equal(AddressZero);
      });

      it("invoking initialize should set owner", async () => {
        const [signer] = await ethers.getSigners();
        expect(await merklePayoutStrategyFactory.owner()).to.equal(
          ethers.constants.AddressZero
        );
        await merklePayoutStrategyFactory.initialize();
        expect(await merklePayoutStrategyFactory.owner()).to.equal(
          signer.address
        );
      });
      it("invoking initialize more than once SHOULD revert the transaction ", async () => {
        await merklePayoutStrategyFactory.initialize();
        expect(merklePayoutStrategyFactory.initialize()).to.revertedWith(
          "Initializable: contract is already initialized"
        );
      });
    });

    describe("test: updatePayoutImplementation", () => {
      beforeEach(async () => {
        [user] = await ethers.getSigners();
        merklePayoutStrategyFactoryArtifact = await artifacts.readArtifact(
          "MerklePayoutStrategyFactory"
        );

        merklePayoutStrategyFactory = <MerklePayoutStrategyFactory>(
          await deployContract(user, merklePayoutStrategyFactoryArtifact, [])
        );

        merklePayoutStrategyImplementationArtifact =
          await artifacts.readArtifact("MerklePayoutStrategyImplementation");

        merklePayoutStrategyImplementation = <
          MerklePayoutStrategyImplementation
        >await deployContract(
          user,
          merklePayoutStrategyImplementationArtifact,
          []
        );

        // eslint-disable-next-line no-unused-expressions
        expect(
          isAddress(merklePayoutStrategyFactory.address),
          "failed to deploy merklepayoutfactory"
        ).to.be.true;

        // Verify deploy
        // eslint-disable-next-line no-unused-expressions
        expect(
          isAddress(merklePayoutStrategyImplementation.address),
          "Failed to deploy MerklePayoutStrategy"
        ).to.be.true;

        // Verify default value
        const metaPtr =
          await merklePayoutStrategyImplementation.distributionMetaPtr();
        expect(metaPtr.protocol).to.equal(0);
        // eslint-disable-next-line no-unused-expressions
        expect(metaPtr.pointer).to.be.empty;

        expect(
          await merklePayoutStrategyImplementation.roundAddress()
        ).to.equal(AddressZero);
        await merklePayoutStrategyFactory.initialize();
      });
      it("invoking updatePayoutImplementation SHOULD update the payout Implementation", async () => {
        expect(
          await merklePayoutStrategyFactory.updatePayoutImplementation(
            merklePayoutStrategyImplementation.address
          )
        )
          .to.emit(merklePayoutStrategyFactory, "PayoutImplementationUpdate")
          .withArgs(merklePayoutStrategyImplementation.address);
      });
      it("invoking updatePayoutImplementation SHOULD REVERT if called by incorrect EOA", async () => {
        const [_, rando] = await ethers.getSigners();
        await expect(
          merklePayoutStrategyFactory
            .connect(rando)
            .updatePayoutImplementation(
              merklePayoutStrategyImplementation.address
            )
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("test: create", () => {
      beforeEach(async () => {
        [user] = await ethers.getSigners();
        merklePayoutStrategyFactoryArtifact = await artifacts.readArtifact(
          "MerklePayoutStrategyFactory"
        );

        merklePayoutStrategyFactory = <MerklePayoutStrategyFactory>(
          await deployContract(user, merklePayoutStrategyFactoryArtifact, [])
        );

        merklePayoutStrategyImplementationArtifact =
          await artifacts.readArtifact("MerklePayoutStrategyImplementation");

        merklePayoutStrategyImplementation = <
          MerklePayoutStrategyImplementation
        >await deployContract(
          user,
          merklePayoutStrategyImplementationArtifact,
          []
        );

        // eslint-disable-next-line no-unused-expressions
        expect(
          isAddress(merklePayoutStrategyFactory.address),
          "failed to deploy merklepayoutfactory"
        ).to.be.true;

        // Verify deploy
        // eslint-disable-next-line no-unused-expressions
        expect(
          isAddress(merklePayoutStrategyImplementation.address),
          "Failed to deploy MerklePayoutStrategy"
        ).to.be.true;

        // Verify default value
        const metaPtr =
          await merklePayoutStrategyImplementation.distributionMetaPtr();
        expect(metaPtr.protocol).to.equal(0);
        // eslint-disable-next-line no-unused-expressions
        expect(metaPtr.pointer).to.be.empty;

        expect(
          await merklePayoutStrategyImplementation.roundAddress()
        ).to.equal(AddressZero);
        await merklePayoutStrategyFactory.initialize();
      });

      it("invoking create SHOULD clone a new payout contract", async () => {
        await merklePayoutStrategyFactory.updatePayoutImplementation(
          merklePayoutStrategyImplementation.address
        );
        const cloneAddress =
          await merklePayoutStrategyFactory.callStatic.create();
        expect(await merklePayoutStrategyFactory.create())
          .to.emit(merklePayoutStrategyFactory, "PayoutContractCreated")
          .withArgs(cloneAddress, merklePayoutStrategyImplementation.address);
      });

      it("invoking create SHOULD REVERT if called with payout implementation not set ", async () => {
        await expect(merklePayoutStrategyFactory.create()).to.be.revertedWith(
          "payoutImplementation not set"
        );
      });
    });
  });
});

/** 
 *      const merkleRoot = ethers.utils.formatBytes32String("MERKLE_ROOT");
      const distributionMetaPtr = {
        protocol: 1,
        pointer: "bafybeiaoakfoxjwi2kwh43djbmomroiryvhv5cetg74fbtzwef7hzzvrnq",
      };

      const encodedDistribution = encodeMerkleUpdateDistributionParameters([
        merkleRoot,
        distributionMetaPtr,
      ]);

 * it("invoking updateDistribution SHOULD revert IF round address is not set", async () => {
        const txn =
          merklePayoutStrategyImplementation.updateDistribution(
            encodedDistribution
          );
        await expect(txn).to.be.revertedWith(
          "error: payout contract not linked to a round"
        );
      });

      it("invoking updateDistribution SHOULD revert IF invoked by an address which is not roundAddress", async () => {
        const [_, anotherUser] = await ethers.getSigners();

        // Invoke init
        await merklePayoutStrategyImplementation.initialize();

        const txn = merklePayoutStrategyImplementation
          .connect(anotherUser)
          .updateDistribution(encodedDistribution);

        await expect(txn).to.be.revertedWith(
          "error: can be invoked only by round contract"
        );
      });

      it("invoking updateDistribution SHOULD emit event DistributionUpdated", async () => {
        // Invoke init
        await merklePayoutStrategyImplementation.init();

        const txn = await merklePayoutStrategyImplementation.updateDistribution(
          encodedDistribution
        );
        expect(txn)
          .to.emit(merklePayoutStrategyImplementation, "DistributionUpdated")
          .withArgs(merkleRoot, [
            distributionMetaPtr.protocol,
            distributionMetaPtr.pointer,
          ]);
      });

      it("invoking updateDistribution SHOULD update public variables", async () => {
        // Invoke init
        await merklePayoutStrategyImplementation.init();

        // Update distribution
        await merklePayoutStrategyImplementation.updateDistribution(
          encodedDistribution
        );

        await expect(
          await merklePayoutStrategyImplementation.merkleRoot()
        ).to.equal(merkleRoot);

        const metaPtr =
          await merklePayoutStrategyImplementation.distributionMetaPtr();
        expect(metaPtr.protocol).to.equal(distributionMetaPtr.protocol);
        expect(metaPtr.pointer).to.equal(distributionMetaPtr.pointer);
      }); */
