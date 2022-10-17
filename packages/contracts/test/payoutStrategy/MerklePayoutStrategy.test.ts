import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { isAddress } from "ethers/lib/utils";
import { artifacts, ethers } from "hardhat";
import { Artifact } from "hardhat/types";
import { MerklePayoutStrategy } from "../../typechain";
import { AddressZero } from "@ethersproject/constants";
import { encodeMerkleUpdateDistributionParameters } from "../../scripts/utils";

describe("MerklePayoutStrategy", () =>  {

  let user: SignerWithAddress;
  let merklePayoutStrategy: MerklePayoutStrategy;
  let merklePayoutStrategyArtifact: Artifact;

  describe('constructor', () => {

    it('deploys properly', async () => {

      [user] = await ethers.getSigners();

      merklePayoutStrategyArtifact = await artifacts.readArtifact('MerklePayoutStrategy');
      merklePayoutStrategy = <MerklePayoutStrategy>await deployContract(user, merklePayoutStrategyArtifact, []);

     // Verify deploy
      expect(isAddress(merklePayoutStrategy.address), 'Failed to deploy MerklePayoutStrategy').to.be.true;

      // Verify default value
      const metaPtr = await merklePayoutStrategy.distributionMetaPtr();
      expect(metaPtr.protocol).to.equal(0);
      expect(metaPtr.pointer).to.be.empty;

      expect(await merklePayoutStrategy.roundAddress()).to.equal(AddressZero);
    });
  })

  describe('core functions', () => {

    describe('test: init',() => {
      beforeEach(async () => {
        [user] = await ethers.getSigners();

        // Deploy MerklePayoutStrategy contract
        merklePayoutStrategyArtifact = await artifacts.readArtifact('MerklePayoutStrategy');
        merklePayoutStrategy = <MerklePayoutStrategy>await deployContract(user, merklePayoutStrategyArtifact, []);

        // Invoke init
        await merklePayoutStrategy.init();
      });

      it('invoking init once SHOULD set the round address', async () => {
        expect(await merklePayoutStrategy.roundAddress()).to.equal(user.address);
      });

      it('invoking init more than once SHOULD revert the transaction ', () => {
        expect(merklePayoutStrategy.init()).to.revertedWith('init: roundAddress already set')
      });
    });

    describe('test: updateDistribution',() => {

      const merkleRoot = ethers.utils.formatBytes32String("MERKLE_ROOT");
      const distributionMetaPtr = { protocol: 1, pointer: "bafybeiaoakfoxjwi2kwh43djbmomroiryvhv5cetg74fbtzwef7hzzvrnq" };

      const encodedDistribution = encodeMerkleUpdateDistributionParameters([
        merkleRoot,
        distributionMetaPtr
      ])

      beforeEach(async () => {
        [user] = await ethers.getSigners();

        // Deploy MerklePayoutStrategy contract
        merklePayoutStrategyArtifact = await artifacts.readArtifact('MerklePayoutStrategy');
        merklePayoutStrategy = <MerklePayoutStrategy>await deployContract(user, merklePayoutStrategyArtifact, []);
      });

      it('invoking updateDistribution SHOULD revert IF round address is not set', async () => {
        const txn = merklePayoutStrategy.updateDistribution(encodedDistribution);
        await expect(txn).to.be.revertedWith("error: payout contract not linked to a round")
      });

      it('invoking updateDistribution SHOULD revert IF invoked by an address which is not roundAddress', async () => {

        const [_, anotherUser] = await ethers.getSigners();

        // Invoke init
        await merklePayoutStrategy.init();

        const txn = merklePayoutStrategy.connect(anotherUser).updateDistribution(encodedDistribution);

        await expect(txn).to.be.revertedWith("error: can be invoked only by round contract");
      });

      it('invoking updateDistribution SHOULD emit event DistributionUpdated', async () => {
        // Invoke init
        await merklePayoutStrategy.init();

        const txn = await merklePayoutStrategy.updateDistribution(encodedDistribution);
        expect(txn)
        .to.emit(merklePayoutStrategy,  'DistributionUpdated')
        .withArgs(
          merkleRoot,
          [ distributionMetaPtr.protocol, distributionMetaPtr.pointer ]
        );
      });

      it('invoking updateDistribution SHOULD update public variables', async () => {
        // Invoke init
        await merklePayoutStrategy.init();

        // Update distribution
        await merklePayoutStrategy.updateDistribution(encodedDistribution);

        await expect( await merklePayoutStrategy.merkleRoot()).to.equal(merkleRoot);

        const metaPtr = await merklePayoutStrategy.distributionMetaPtr();
        expect(metaPtr.protocol).to.equal(distributionMetaPtr.protocol);
        expect(metaPtr.pointer).to.equal(distributionMetaPtr.pointer);

      });

    });

  });
});