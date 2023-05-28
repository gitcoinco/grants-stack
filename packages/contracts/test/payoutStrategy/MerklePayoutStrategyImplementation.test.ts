import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { BytesLike, isAddress } from "ethers/lib/utils";
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
import {
  arrayToDistribution,
  encodeMerkleUpdateDistributionParameters,
  encodeRoundParameters,
} from "../../scripts/utils";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { before } from "mocha";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("MerklePayoutStrategyImplementation", () => {
  let user: SignerWithAddress;

  // payout strategy
  let merklePayoutStrategyImplementation: MerklePayoutStrategyImplementation;
  let merklePayoutStrategyImplementationArtifact: Artifact;
  let merklePayoutStrategyFactoryArtifact: Artifact;
  let merklePayoutStrategyFactory: MerklePayoutStrategyFactory

  // roundFactory
  let roundFactoryFactory: RoundFactory__factory;
  let roundFactory: RoundFactory;
  let roundImplementation: RoundImplementation;
  let roundImplementationArtifact: Artifact;

  // voting strategy
  let votingStrategyContract: QuadraticFundingVotingStrategyImplementation;
  let votingStrategyArtifact: Artifact;

  //  mockERC20
  let mockERC20Artifact: Artifact;
  let mockERC20Contract: MockERC20;
  // init variables
  let _currentBlockTimestamp: number;

  const merkleRoot: BytesLike = ethers.utils.formatBytes32String("MERKLE_ROOT");
  const distributionMetaPtr = {
    protocol: 1,
    pointer: "bafybeiaoakfoxjwi2kwh43djbmomroiryvhv5cetg74fbtzwef7hzzvrnq",
  };

  const encodedDistribution = encodeMerkleUpdateDistributionParameters([
    merkleRoot,
    distributionMetaPtr,
  ]);

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
    it("invoking initialize more than once SHOULD revert the transaction ", async () => {
      // eslint-disable-next-line no-unused-expressions
      await expect(merklePayoutStrategyImplementation.initialize()).to.not.be
        .reverted;
      await expect(
        merklePayoutStrategyImplementation.initialize()
      ).to.revertedWith("Initializable: contract is already initialized");
    });
    it("SHOULD have an empty merkle root after deploy", async () => {
      expect(await merklePayoutStrategyImplementation.merkleRoot()).to.be.equal(
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      );
    });
  });

  describe("core functions", () => {
    let encodedRoundParams: BytesLike;
    beforeEach(async () => {
      _currentBlockTimestamp = (
        await ethers.provider.getBlock(await ethers.provider.getBlockNumber())
      ).timestamp;

      const applicationsStartTime = _currentBlockTimestamp + 100; // 1 hour later
      const applicationsEndTime = _currentBlockTimestamp + 250; // 2 hours later
      const roundStartTime = _currentBlockTimestamp + 500; // 3 hours later
      const roundEndTime = _currentBlockTimestamp + 1000; // 4 hours later

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
      encodedRoundParams = encodeRoundParameters(params);
      roundImplementation.initialize(encodedRoundParams);
    });
    describe("test: updateDistribution", () => {
      it("invoking updateDistribution SHOULD update the merkle root", async () => {
        // advance to round end
        await time.increase(1300);

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
        expect(await merklePayoutStrategyImplementation.merkleRoot()).to.equal(
          merkleRoot
        );
      });
      it("invoking updateDistribution SHOULD revert if round has not ended", async () => {
        expect(
          await merklePayoutStrategyImplementation.isReadyForPayout()
        ).to.equal(false);
        const tx =
          merklePayoutStrategyImplementation.updateDistribution(
            encodedDistribution
          );

        await expect(tx).to.revertedWith("round has not ended");
      });
      it("invoking updateDistribution SHOULD revert if round has been set ready for payout", async () => {
        // end round
        await time.increase(1300);
        await mockERC20Contract.connect(user).mint(1100);
        await mockERC20Contract
          .connect(user)
          .transfer(roundImplementation.address, 110);

        await merklePayoutStrategyImplementation.updateDistribution(
          encodedDistribution
        );
        await roundImplementation.setReadyForPayout();

        expect(
          await merklePayoutStrategyImplementation.isReadyForPayout()
        ).to.equal(true);

        const tx =
          merklePayoutStrategyImplementation.updateDistribution(
            encodedDistribution
          );

        await expect(tx).to.revertedWith("Payout: Already ready for payout");
      });
      it("invoking updateDistribution SHOULD revert IF invoked by an address which is not roundAddress", async () => {
        const [_, anotherUser] = await ethers.getSigners();
        // end round
        await time.increase(1300);
        // Invoke init
        await merklePayoutStrategyImplementation.initialize();

        const txn = merklePayoutStrategyImplementation
          .connect(anotherUser)
          .updateDistribution(encodedDistribution);

        await expect(txn).to.be.revertedWith("not round operator");
      });
    });
    describe("test: payout", () => {
      let grantee1: SignerWithAddress;
      let grantee2: SignerWithAddress;
      let grantee3: SignerWithAddress;
      let tree: StandardMerkleTree<[string, number, string]>;
      let distributions: [string, number, string][];
      beforeEach(
        "add funds, calculate merkle tree, set ready for payout",
        async () => {
          [user, grantee1, grantee2, grantee3] = await ethers.getSigners();
          // mint and transfer funds
          await mockERC20Contract.connect(user).mint(1000);
          await mockERC20Contract
            .connect(user)
            .transfer(roundImplementation.address, 900);
          // update match amount
          await roundImplementation.updateMatchAmount(500);

          distributions = [
            [
              grantee1.address,
              100,
              ethers.utils.formatBytes32String("project1"),
            ],
            [
              grantee2.address,
              200,
              ethers.utils.formatBytes32String("project2"),
            ],
            [
              grantee3.address,
              300,
              ethers.utils.formatBytes32String("project3"),
            ],
          ];

          tree = StandardMerkleTree.of(distributions, [
            "address",
            "uint256",
            "bytes32",
          ]);

          // end round
          await time.increase(1300);
          await merklePayoutStrategyImplementation.updateDistribution(
            encodeMerkleUpdateDistributionParameters([
              tree.root,
              { protocol: 1, pointer: "test" },
            ])
          );
          // eslint-disable-next-line no-unused-expressions
          expect(await merklePayoutStrategyImplementation.isDistributionSet())
            .to.be.true;
        }
      );
      it("invoking payout SHOULD distribute funds with ERC20", async () => {
        // Prepare Payout
        const proofUser = tree.getProof(distributions[1]);
        const proofUser2 = tree.getProof(distributions[2]);
        const payouts = [
          [
            distributions[1][0],
            distributions[1][1],
            proofUser,
            distributions[1][2],
          ],
          [
            distributions[2][0],
            distributions[2][1],
            proofUser2,
            distributions[2][2],
          ],
        ];
        const distribution = arrayToDistribution(payouts);
        // set ready for payout
        // eslint-disable-next-line no-unused-expressions
        await expect(roundImplementation.setReadyForPayout()).to.not.be
          .reverted;

        const tx = await merklePayoutStrategyImplementation.payout(
          distribution
        );
        await expect(tx)
          .to.emit(merklePayoutStrategyImplementation, "BatchPayoutSuccessful")
          .withArgs(user.address);

        /* Verify balance */
        const balance2 = await mockERC20Contract.balanceOf(grantee2.address);
        expect(balance2).to.equal(200);
        const balance3 = await mockERC20Contract.balanceOf(grantee3.address);
        expect(balance3).to.equal(300);
      });
      it("invoking payout SHOULD revert if there is an empty proof", async () => {
        // Prepare Payout
        const [_, grant1] = await ethers.getSigners();
        const payouts = [
          [grant1.address, 1, [], ethers.utils.formatBytes32String("test")],
        ];
        const distribution = arrayToDistribution(payouts);
        // set ready for payout
        // eslint-disable-next-line no-unused-expressions
        expect(await roundImplementation.setReadyForPayout()).to.not.be;
        // payout
        await expect(
          merklePayoutStrategyImplementation.payout(distribution)
        ).to.be.revertedWith("Payout: Invalid proof");
      });
      it("invoking payout SHOULD revert if not ready for payout", async () => {
        const [_, grant1] = await ethers.getSigners();
        // Prepare Payout
        const payouts = [
          [grant1.address, 10, [], ethers.utils.formatBytes32String("test")],
        ];

        const distribution = arrayToDistribution(payouts);

        await expect(
          merklePayoutStrategyImplementation.payout(distribution)
        ).to.be.revertedWith("Payout: Not ready for payout");
      });
      it("invoking payout SHOULD revert if an non round operator attempts to call payout", async () => {
        // Prepare Payout
        const [_, grant1] = await ethers.getSigners();
        const payouts = [
          [grant1.address, 1, [], ethers.utils.formatBytes32String("test")],
        ];
        const distribution = arrayToDistribution(payouts);
        // set ready for payout
        // eslint-disable-next-line no-unused-expressions
        expect(await roundImplementation.setReadyForPayout()).to.not.be;
        // payout
        await expect(
          merklePayoutStrategyImplementation
            .connect(grant1)
            .payout(distribution)
        ).to.be.revertedWith("not round operator");
      });
    });
  });
});
