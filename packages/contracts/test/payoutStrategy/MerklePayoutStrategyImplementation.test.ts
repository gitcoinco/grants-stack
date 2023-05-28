import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { isAddress } from "ethers/lib/utils";
import { artifacts, ethers, upgrades } from "hardhat";
import { Artifact } from "hardhat/types";
import {
  MerklePayoutStrategyImplementation,
  MerklePayoutStrategyFactory,
  RoundFactory,
  RoundImplementation,
  RoundFactory__factory,
  QuadraticFundingRelayStrategyImplementation,
  MockERC20,
  QuadraticFundingVotingStrategyImplementation,
} from "../../typechain";
import { AddressZero } from "@ethersproject/constants";
import {
  encodeMerkleUpdateDistributionParameters,
  encodeRoundParameters,
} from "../../scripts/utils";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import fs from "fs";
import { Address } from "cluster";
import { before } from "mocha";
import { BigNumberish } from "ethers";
import { deploy } from "@openzeppelin/hardhat-upgrades/dist/utils";

describe.only("MerklePayoutStrategyImplementation", () => {
  let user: SignerWithAddress;

  // payout strategy
  let merklePayoutStrategyImplementation: MerklePayoutStrategyImplementation;
  let merklePayoutStrategyImplementationArtifact: Artifact;
  let merklePayoutStrategyFactory: MerklePayoutStrategyFactory;
  let merklePayoutStrategyFactoryArtifact: Artifact;

  // roundFactory
  let roundFactory: RoundFactory;
  let roundFactoryFactory: RoundFactory__factory;
  let roundImplementation: RoundImplementation;
  let roundImplementationArtifact: Artifact;

  // voting strategy
  let votingStrategyContract: QuadraticFundingVotingStrategyImplementation;
  let votingStrategyArtifact: Artifact;

  //mockERC20
  let mockERC20Artifact: Artifact;
  let mockERC20Contract: MockERC20;
  // init variables
  let _currentBlockTimestamp: number;
  const ROUND_OPERATOR_ROLE = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("ROUND_OPERATOR")
  );

  before(async () => {
    [user] = await ethers.getSigners();

    roundFactoryFactory = await ethers.getContractFactory("RoundFactory");

    roundFactory = <RoundFactory>(
      await upgrades.deployProxy(roundFactoryFactory)
    );

    roundImplementationArtifact = await artifacts.readArtifact(
      "RoundImplementation"
    );

    merklePayoutStrategyFactoryArtifact = await artifacts.readArtifact(
      "MerklePayoutStrategyFactory"
    );

    merklePayoutStrategyFactory = <MerklePayoutStrategyFactory>(
      await deployContract(user, merklePayoutStrategyFactoryArtifact, [])
    );
  });

  describe("deployment", () => {
    it("deploys properly", async () => {
      [user] = await ethers.getSigners();

      // Deploy MerklePayoutStrategyImplementation
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

      // Verify deploy
      // eslint-disable-next-line no-unused-expressions
      expect(
        isAddress(merklePayoutStrategyImplementation.address),
        "Failed to deploy MerklePayoutStrategyImplementation"
      ).to.be.true;
    });
  });

  describe("core functions", () => {
    const merkleRoot = ethers.utils.formatBytes32String("MERKLE_ROOT");
    const distributionMetaPtr = {
      protocol: 1,
      pointer: "bafybeiaoakfoxjwi2kwh43djbmomroiryvhv5cetg74fbtzwef7hzzvrnq",
    };

    const encodedDistribution = encodeMerkleUpdateDistributionParameters([
      merkleRoot,
      distributionMetaPtr,
    ]);

    beforeEach(async () => {
      _currentBlockTimestamp = (
        await ethers.provider.getBlock(await ethers.provider.getBlockNumber())
      ).timestamp;

      const applicationsStartTime = _currentBlockTimestamp + 3600; // 1 hour later
      const applicationsEndTime = _currentBlockTimestamp + 7200; // 2 hours later
      const roundStartTime = _currentBlockTimestamp + 10800; // 3 hours later
      const roundEndTime = _currentBlockTimestamp + 14400; // 4 hours later

      // Deploy MerklePayoutStrategyImplementation
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

      roundImplementation = <RoundImplementation>(
        await deployContract(user, roundImplementationArtifact, [])
      );

      votingStrategyArtifact = await artifacts.readArtifact(
        "QuadraticFundingRelayStrategyImplementation"
      );

      votingStrategyContract = <QuadraticFundingRelayStrategyImplementation>(
        await deployContract(user, votingStrategyArtifact, [])
      );

      mockERC20Artifact = await artifacts.readArtifact("MockERC20");
      mockERC20Contract = <MockERC20>(
        await deployContract(user, mockERC20Artifact, [0])
      );

      const params = [
        votingStrategyContract.address, // _votingStrategyAddress
        merklePayoutStrategyImplementation.address, // _payoutStrategyAddress
        applicationsStartTime, // _applicationsStartTime
        applicationsEndTime, // _applicationsEndTime
        roundStartTime, // _roundStartTime
        roundEndTime, // _roundEndTime
        mockERC20Contract.address, // _token
        {
          protocol: 1,
          pointer:
            "bafybeia4khbew3r2mkflyn7nzlvfzcb3qpfeftz5ivpzfwn77ollj47gqi",
        }, // _roundMetaPtr
        {
          protocol: 1,
          pointer:
            "bafybeiaoakfoxjwi2kwh43djbmomroiryvhv5cetg74fbtzwef7hzzvrnq",
        }, // _applicationMetaPtr
        [user.address], // _adminRoles
        [user.address, ethers.Wallet.createRandom().address], // _roundOperators
      ];
      const encodedRoundParams = encodeRoundParameters(params);
      roundImplementation.initialize(encodedRoundParams);
    });
    describe("test: updateDistribution", () => {
      it("invoking updateDistribution SHOULD update the distribution", async () => {
        expect(
          await merklePayoutStrategyImplementation
            .connect(user)
            .updateDistribution(encodedDistribution)
        )
          .to.emit(merklePayoutStrategyImplementation, "DistributionUpdated")
          .withArgs(merkleRoot, [
            1,
            "bafybeiaoakfoxjwi2kwh43djbmomroiryvhv5cetg74fbtzwef7hzzvrnq",
          ]);
      });
      it("invoking initialize more than once SHOULD revert the transaction ", async () => {
        expect(merklePayoutStrategyImplementation.initialize()).to.revertedWith(
          "Initializable: contract is already initialized"
        );
      });
    });
  });
});

/** 
 * 
 *       
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
