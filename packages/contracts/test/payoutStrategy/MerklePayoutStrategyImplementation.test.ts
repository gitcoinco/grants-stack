import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { Wallet } from "ethers";
import { BytesLike, hexlify, isAddress, randomBytes } from "ethers/lib/utils";
import { artifacts, ethers, upgrades } from "hardhat";
import { Artifact } from "hardhat/types";
import { encodeRoundParameters } from "../../scripts/utils";
import {
  MerklePayoutStrategyImplementation,
  MockERC20,
  MockRoundImplementation,
  QuadraticFundingVotingStrategyImplementation,
  RoundFactory,
  RoundFactory__factory,
  RoundImplementation,
} from "../../typechain";

const RANDOM_BYTES32 = randomBytes(32);

describe.only("MerklePayoutStrategyImplementation", function () {
  let user: SignerWithAddress;

  // Round Factory
  // eslint-disable-next-line camelcase
  let roundContractFactory: RoundFactory__factory;
  let roundFactoryContract: RoundFactory;

  // Round Implementation
  let roundImplementation: MockRoundImplementation;
  let roundImplementationArtifact: Artifact;

  // Voting Strategy
  let votingStrategyContract: QuadraticFundingVotingStrategyImplementation;
  let votingStrategyArtifact: Artifact;

  // MerklePayoutStrategy Implementation
  let merklePayoutStrategy: MerklePayoutStrategyImplementation;
  let merklePayoutStrategyArtifact: Artifact;

  let mockERC20: MockERC20;
  let mockERC20Artifact: Artifact;

  // eslint-disable-next-line no-unused-vars
  const VERSION = "0.2.0";

  before(async () => {
    [user] = await ethers.getSigners();

    // Deploy RoundFactory contract
    roundContractFactory = await ethers.getContractFactory("RoundFactory");
    roundFactoryContract = <RoundFactory>(
      await upgrades.deployProxy(roundContractFactory)
    );

    // Deploy MerklePayoutStrategyImplementation
    merklePayoutStrategyArtifact = await artifacts.readArtifact(
      "MerklePayoutStrategyImplementation"
    );
    merklePayoutStrategy = <MerklePayoutStrategyImplementation>(
      await deployContract(user, merklePayoutStrategyArtifact, [])
    );

    roundImplementationArtifact = await artifacts.readArtifact(
      "RoundImplementation"
    );
  });

  describe("constructor", () => {
    it("SHOULD deploy properly", async () => {
      [user] = await ethers.getSigners();

      // Deploy MerklePayoutStrategyImplementation
      merklePayoutStrategyArtifact = await artifacts.readArtifact(
        "MerklePayoutStrategyImplementation"
      );
      merklePayoutStrategy = <MerklePayoutStrategyImplementation>(
        await deployContract(user, merklePayoutStrategyArtifact, [])
      );

      // Verify deploy
      expect(
        isAddress(merklePayoutStrategy.address),
        "Failed to deploy MerklePayoutStrategyImplementation"
      ).to.be.true;
    });
  });

  let _currentBlockTimestamp: number;

  describe("MerklePayoutStrategyImplementation functions", () => {
    const initPayoutStrategy = async (
      _currentBlockTimestamp: number,
      payoutStrategyContract: MerklePayoutStrategyImplementation,
      overrides?: any
    ) => {
      // Deploy MockERC20 contract if _token is not provided
      mockERC20Artifact = await artifacts.readArtifact("MockERC20");
      mockERC20 = <MockERC20>(
        await deployContract(user, mockERC20Artifact, [10000])
      );
      const token =
        overrides && overrides.hasOwnProperty("token")
          ? overrides.token
          : mockERC20.address;

      const roundMetaPtr = {
        protocol: 1,
        pointer: "bafybeia4khbew3r2mkflyn7nzlvfzcb3qpfeftz5ivpzfwn77ollj47gqi",
      };
      const applicationMetaPtr = {
        protocol: 1,
        pointer: "bafybeiaoakfoxjwi2kwh43djbmomroiryvhv5cetg74fbtzwef7hzzvrnq",
      };

      const adminRoles = [user.address];
      const roundOperators = [
        user.address,
        Wallet.createRandom().address,
        Wallet.createRandom().address,
      ];

      // Deploy RoundImplementation contract
      roundImplementationArtifact = await artifacts.readArtifact(
        "MockRoundImplementation"
      );
      roundImplementation = <MockRoundImplementation>(
        await deployContract(user, roundImplementationArtifact, [])
      );

      // Deploy voting strategy
      votingStrategyArtifact = await artifacts.readArtifact(
        "QuadraticFundingVotingStrategyImplementation"
      );
      votingStrategyContract = <QuadraticFundingVotingStrategyImplementation>(
        await deployContract(user, votingStrategyArtifact, [])
      );
      const amount = 100;

      const initAddress = [
        votingStrategyContract.address, // votingStrategy
        payoutStrategyContract.address, // payoutStrategy
      ];

      const initRoundTime = [
        _currentBlockTimestamp + 100, // applicationsStartTime
        _currentBlockTimestamp + 250, // applicationsStartTime
        _currentBlockTimestamp + 500, // roundStartTime
        _currentBlockTimestamp + 1000, // roundEndTime
      ];

      const initMetaPtr = [roundMetaPtr, applicationMetaPtr];

      const initRoles = [adminRoles, roundOperators];

      const params = [
        initAddress,
        initRoundTime,
        amount,
        token,
        initMetaPtr,
        initRoles,
      ];

      await roundImplementation.initialize(
        encodeRoundParameters(params),
        roundFactoryContract.address // Wallet.createRandom().address
      );
    };

    describe("test: init", () => {
      beforeEach(async () => {
        const protocolTreasury = Wallet.createRandom().address;
        await roundFactoryContract.updateProtocolTreasury(protocolTreasury);

        [user] = await ethers.getSigners();

        _currentBlockTimestamp = (
          await ethers.provider.getBlock(await ethers.provider.getBlockNumber())
        ).timestamp;
        // Deploy MerklePayoutStrategyImplementation
        merklePayoutStrategyArtifact = await artifacts.readArtifact(
          "MerklePayoutStrategyImplementation"
        );
        merklePayoutStrategy = <MerklePayoutStrategyImplementation>(
          await deployContract(user, merklePayoutStrategyArtifact, [])
        );

        await initPayoutStrategy(_currentBlockTimestamp, merklePayoutStrategy);
      });

      describe("test: updateDistribution", () => {
        it("SHOULD have empty merkle root after deploy", async () => {
          expect(await merklePayoutStrategy.merkleRoot()).to.be.equal(
            "0x0000000000000000000000000000000000000000000000000000000000000000"
          );
        });

        it("SHOULD revert if round has not ended", async () => {
          expect(await merklePayoutStrategy.isReadyForPayout()).to.equal(false);
          const tx = merklePayoutStrategy.updateDistribution(RANDOM_BYTES32);
          await expect(tx).to.revertedWith("round has not ended");
        });

        it("SHOULD revert if ready for payout", async () => {
          await ethers.provider.send("evm_mine", [
            _currentBlockTimestamp + 1300,
          ]);
          await mockERC20.transfer(roundImplementation.address, 110);

          await roundImplementation.setReadyForPayout();

          expect(await merklePayoutStrategy.isReadyForPayout()).to.equal(true);

          const tx = merklePayoutStrategy.updateDistribution(RANDOM_BYTES32);

          await expect(tx).to.revertedWith(
            "Payout: Cannot update dsitribution once ready for payout"
          );
        });

        it("SHOULD update merkle root", async () => {
          await ethers.provider.send("evm_mine", [
            _currentBlockTimestamp + 1300,
          ]);
          expect(await merklePayoutStrategy.isReadyForPayout()).to.equal(false);

          await merklePayoutStrategy.updateDistribution(
            encodeDistributionParameters(hexlify(RANDOM_BYTES32), 1, "test")
          );

          expect(await merklePayoutStrategy.merkleRoot()).to.be.equal(
            hexlify(RANDOM_BYTES32)
          );
        });
      });
    });

    describe("test: hasBeenDistributed", () => {
      beforeEach(async () => {
        const protocolTreasury = Wallet.createRandom().address;
        await roundFactoryContract.updateProtocolTreasury(protocolTreasury);

        [user] = await ethers.getSigners();

        _currentBlockTimestamp = (
          await ethers.provider.getBlock(await ethers.provider.getBlockNumber())
        ).timestamp;
        // Deploy MerklePayoutStrategyImplementation
        merklePayoutStrategyArtifact = await artifacts.readArtifact(
          "MerklePayoutStrategyImplementation"
        );
        merklePayoutStrategy = <MerklePayoutStrategyImplementation>(
          await deployContract(user, merklePayoutStrategyArtifact, [])
        );

        await initPayoutStrategy(_currentBlockTimestamp, merklePayoutStrategy);
        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 1300]);
      });

      it("SHOULD return false if not distributed", async () => {
        const hasDistributed = await merklePayoutStrategy.hasBeenDistributed(0);
        expect(hasDistributed).to.be.false;
      });

      it("SHOULD return false if not distributed (test for cross-payout contamination)", async () => {
        const { distributions, tree } = await preparePayoutContract(
          merklePayoutStrategy,
          roundImplementation,
          mockERC20
        );

        // Prepare Payout
        const validMerkleProof = tree.getProof(distributions[0]);
        const payouts = [
          [0, distributions[0][1], distributions[0][2], validMerkleProof],
        ];
        const encodedPayoutData = encodeMerklePayoutParameters(payouts);

        await merklePayoutStrategy.payout(encodedPayoutData);
        const hasDistributed = await merklePayoutStrategy.hasBeenDistributed(1);
        expect(hasDistributed).to.be.false;
      });

      it("SHOULD return true if funds have been distributed", async () => {
        const { distributions, tree } = await preparePayoutContract(
          merklePayoutStrategy,
          roundImplementation,
          mockERC20
        );

        // Prepare Payout
        const validMerkleProof = tree.getProof(distributions[0]);
        const payouts = [
          [0, distributions[0][1], distributions[0][2], validMerkleProof],
        ];
        const encodedPayoutData = encodeMerklePayoutParameters(payouts);

        await merklePayoutStrategy.payout(encodedPayoutData);
        const hasDistributed = await merklePayoutStrategy.hasBeenDistributed(0);
        expect(hasDistributed).to.be.true;
      });

      it("SHOULD return false for invalid index", async () => {
        const hasDistributed = await merklePayoutStrategy.hasBeenDistributed(
          200
        );
        expect(hasDistributed).to.be.false;
      });
    });

    describe("test: payout", () => {
      let encodedPayoutData: BytesLike[] = [];

      beforeEach(async () => {
        merklePayoutStrategy = <MerklePayoutStrategyImplementation>(
          await deployContract(user, merklePayoutStrategyArtifact, [])
        );

        _currentBlockTimestamp = (
          await ethers.provider.getBlock(await ethers.provider.getBlockNumber())
        ).timestamp;

        await initPayoutStrategy(_currentBlockTimestamp, merklePayoutStrategy);
        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 1300]);
      });

      it("SHOULD revert if not called by round operator for payout", async () => {
        const [_, notRoundOperator, grant1] = await ethers.getSigners();

        // Prepare Payout
        const payouts = [[0, grant1.address, 10, []]];
        encodedPayoutData = encodeMerklePayoutParameters(payouts);

        const tx = merklePayoutStrategy
          .connect(notRoundOperator)
          .payout(encodedPayoutData);
        await expect(tx).to.revertedWith("not round operator");
      });

      it("SHOULD revert if not ready for payout", async () => {
        const [_, grant1] = await ethers.getSigners();
        // Prepare Payout
        const payouts = [[0, grant1.address, 10, []]];
        encodedPayoutData = encodeMerklePayoutParameters(payouts);

        const tx = merklePayoutStrategy.payout(encodedPayoutData);
        await expect(tx).to.revertedWith("Payout: Not ready for payout");
      });

      it("SHOULD revert for empty proof", async () => {
        // Ensure round is ready for payout
        await roundImplementation.mockSetReadyForPayout();

        // Prepare Payout
        const [_, grant1] = await ethers.getSigners();
        const payouts = [[0, grant1.address, 1, []]];
        encodedPayoutData = encodeMerklePayoutParameters(payouts);

        const tx = merklePayoutStrategy.payout(encodedPayoutData);
        await expect(tx).to.revertedWith("Payout: Invalid proof.");
      });

      it("SHOULD payout successfully using ERC20", async () => {
        const { distributions, tree, user2 } = await preparePayoutContract(
          merklePayoutStrategy,
          roundImplementation,
          mockERC20
        );

        // Prepare Payout
        const validMerkleProof = tree.getProof(distributions[1]);
        const payouts = [
          [1, distributions[1][1], distributions[1][2], validMerkleProof],
        ];
        console.log(
          "node hash from test: ",
          tree.leafHash([1, distributions[1][1], distributions[1][2]])
        );
        encodedPayoutData = encodeMerklePayoutParameters(payouts);
        const decodedData = ethers.utils.defaultAbiCoder.decode(
          ["uint256", "address", "uint256", "bytes32[]"],
          encodedPayoutData[0]
        );
        console.log(encodedPayoutData[0]);

        const tx = merklePayoutStrategy.distribute_encode(encodedPayoutData[0]);

        // const tx = merklePayoutStrategy.payout(encodedPayoutData);
        await expect(tx).to.emit(merklePayoutStrategy, "BatchPayoutSuccessful");

        /* Verify balance */
        const balance = await mockERC20.balanceOf(user2.address);
        expect(balance).to.equal(200);
      });

      it("SHOULD payout successfully using native", async () => {
        const [user] = await ethers.getSigners();

        const randomWallet = ethers.Wallet.createRandom();

        /* Initialize a Round with native token */
        merklePayoutStrategy = <MerklePayoutStrategyImplementation>(
          await deployContract(user, merklePayoutStrategyArtifact, [])
        );

        _currentBlockTimestamp = (
          await ethers.provider.getBlock(await ethers.provider.getBlockNumber())
        ).timestamp;

        await initPayoutStrategy(_currentBlockTimestamp, merklePayoutStrategy, {
          token: ethers.constants.AddressZero,
        });
        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 1300]);

        /* Generate a simple distribution */
        const distributions = [
          [0, user.address, ethers.utils.parseEther("100")],
          [1, randomWallet.address, ethers.utils.parseEther("200")],
        ];

        const tree = StandardMerkleTree.of(distributions, [
          "uint256",
          "address",
          "uint256",
        ]);

        /* Set the merkle root */
        await merklePayoutStrategy.updateDistribution(
          encodeDistributionParameters(tree.root, 1, "test")
        );

        /* Fund the contract */
        await user.sendTransaction({
          to: roundImplementation.address,
          value: ethers.utils.parseEther("300"),
        });

        /* Mark ready for payouts */
        await roundImplementation.setReadyForPayout();

        // Prepare Payout
        const validMerkleProof = tree.getProof(distributions[1]);
        const payouts = [
          [1, distributions[1][1], distributions[1][2], validMerkleProof],
        ];
        encodedPayoutData = encodeMerklePayoutParameters(payouts);

        const tx = merklePayoutStrategy.payout(encodedPayoutData);
        await expect(tx).to.emit(merklePayoutStrategy, "BatchPayoutSuccessful");

        /* Verify balance */
        const balance = await randomWallet
          .connect(ethers.provider)
          .getBalance();
        expect(balance).to.equal(ethers.utils.parseEther("200"));
      });

      it("SHOULD sucessfully distribute token for two accounts", async () => {
        const { distributions, tree, user, user2 } =
          await preparePayoutContract(
            merklePayoutStrategy,
            roundImplementation,
            mockERC20
          );

        // Prepare Payout
        const proofUser = tree.getProof(distributions[0]);
        const proofUser2 = tree.getProof(distributions[1]);
        // [index, grantAddress, amount, merkleProof];
        const payouts = [
          [0, distributions[0][0], distributions[0][1], proofUser],
          [1, distributions[1][0], distributions[1][1], proofUser2],
        ];
        encodedPayoutData = encodeMerklePayoutParameters(payouts);

        const tx = merklePayoutStrategy.payout(encodedPayoutData);
        await expect(tx).to.emit(merklePayoutStrategy, "BatchPayoutSuccessful");

        /* Verify balance */
        const balance2 = await mockERC20.balanceOf(user.address);
        expect(balance2).to.equal(200);
        const balance3 = await mockERC20.balanceOf(user2.address);
        expect(balance3).to.equal(300);
      });

      it("SHOULD sucessfully emit FundsDistributed event twice for 2 accounts", async () => {
        const { distributions, tree } = await preparePayoutContract(
          merklePayoutStrategy,
          roundImplementation,
          mockERC20
        );

        // Prepare Payout
        const proofUser = tree.getProof(distributions[0]);
        const proofUser2 = tree.getProof(distributions[1]);
        const payouts = [
          [0, distributions[0][0], distributions[0][1], proofUser],
          [1, distributions[1][0], distributions[1][1], proofUser2],
        ];
        encodedPayoutData = encodeMerklePayoutParameters(payouts);

        const tx = merklePayoutStrategy.payout(encodedPayoutData);
        await expect(tx).to.emit(merklePayoutStrategy, "FundsDistributed");
        await expect(tx).to.emit(merklePayoutStrategy, "FundsDistributed");
      });

      it("SHOULD revert if contract has not enough funds", async () => {
        const [user, user2, user3] = await ethers.getSigners();

        /* Generate a simple distribution */
        const distributions = [
          [0, user.address, 100],
          [1, user2.address, 200],
          [2, user3.address, 300],
        ];

        const tree = StandardMerkleTree.of(distributions, [
          "uint256",
          "address",
          "uint256",
        ]);

        /* Set the merkle root */
        await merklePayoutStrategy.updateDistribution(
          encodeDistributionParameters(tree.root, 1, "test")
        );

        /* Fund the contract */
        await mockERC20.transfer(roundImplementation.address, 1);

        /* Mark ready for payouts */
        const tx = roundImplementation.setReadyForPayout();
        await expect(tx).to.be.revertedWith("not enough funds");
      });

      it("SHOULD revert when user tries to claim the same distributions twice on one call", async () => {
        const { distributions, tree } = await preparePayoutContract(
          merklePayoutStrategy,
          roundImplementation,
          mockERC20
        );

        // Prepare Payout
        const proofUser = tree.getProof(distributions[0]);
        const payouts = [
          [0, distributions[0][0], distributions[0][1], proofUser],
          [1, distributions[0][0], distributions[0][1], proofUser],
        ];
        encodedPayoutData = encodeMerklePayoutParameters(payouts);

        const tx = merklePayoutStrategy.payout(encodedPayoutData);
        await expect(tx).to.be.revertedWith("funds already distributed");
      });

      it("SHOULD revert transaction when user tries to claim the same distribution in two batches", async () => {
        const { distributions, tree, user2 } = await preparePayoutContract(
          merklePayoutStrategy,
          roundImplementation,
          mockERC20
        );

        // Prepare Payout
        const validMerkleProof = tree.getProof(distributions[1]);
        const payouts = [
          [0, distributions[1][0], distributions[1][1], validMerkleProof],
        ];
        encodedPayoutData = encodeMerklePayoutParameters(payouts);

        const tx = merklePayoutStrategy.payout(encodedPayoutData);
        await expect(tx).to.emit(merklePayoutStrategy, "BatchPayoutSuccessful");

        /* Verify balance */
        const balance = await mockERC20.balanceOf(user2.address);
        expect(balance).to.equal(200);

        const tx2 = merklePayoutStrategy.payout(encodedPayoutData);
        await expect(tx2).to.be.revertedWith("funds already distributed");
      });

      it("SHOULD revert when user tries to distribute more than the proof", async () => {
        const { distributions, tree } = await preparePayoutContract(
          merklePayoutStrategy,
          roundImplementation,
          mockERC20
        );

        // Prepare Payout
        const validMerkleProof = tree.getProof(distributions[1]);
        const payouts = [[0, distributions[1][0], 10000, validMerkleProof]];
        encodedPayoutData = encodeMerklePayoutParameters(payouts);

        const tx = merklePayoutStrategy.payout(encodedPayoutData);
        await expect(tx).to.be.revertedWith("Payout: Invalid proof.");
      });

      it("SHOULD revert when user tries to distribute funds to another address than the proof", async () => {
        const { distributions, tree } = await preparePayoutContract(
          merklePayoutStrategy,
          roundImplementation,
          mockERC20
        );

        // Prepare Payout
        const validMerkleProof = tree.getProof(distributions[1]);
        /* Address in the payout is different to the merkle proof */
        const payouts = [[0, distributions[0][1], 10000, validMerkleProof]];
        encodedPayoutData = encodeMerklePayoutParameters(payouts);

        const tx = merklePayoutStrategy.payout(encodedPayoutData);
        await expect(tx).to.be.revertedWith("Payout: Invalid proof.");
      });
    });
  });
});

async function preparePayoutContract(
  merklePayoutStrategy: MerklePayoutStrategyImplementation,
  roundImplementation: RoundImplementation,
  mockERC20: MockERC20
) {
  const [user, user2, user3] = await ethers.getSigners();

  /* Generate a simple distribution */
  const distributions: [number, string, number][] = [
    [0, user.address, 100],
    [1, user2.address, 200],
    [2, user3.address, 300],
  ];

  const tree = StandardMerkleTree.of(distributions, [
    "uint256",
    "address",
    "uint256",
  ]);

  /* Set the merkle root */
  await merklePayoutStrategy.updateDistribution(
    encodeDistributionParameters(tree.root, 1, "test")
  );

  /* Fund the contract */
  await mockERC20.transfer(roundImplementation.address, 1000);

  /* Mark ready for payouts */
  await roundImplementation.setReadyForPayout();

  return {
    distributions,
    tree,
    user,
    user2,
    user3,
  };
}

// Encode Round Parameters
function encodeDistributionParameters(
  merkleRoot: string,
  protocol: number,
  pointer: string
) {
  return ethers.utils.defaultAbiCoder.encode(
    ["bytes32", "tuple(uint256 protocol, string pointer)"],
    [merkleRoot, { protocol, pointer }]
  );
}

/** Encode Payout Parameters
 /* payout: [index, grantAddress, amount, merkleProof]
 */
function encodeMerklePayoutParameters(payouts: any[]) {
  const encodedPayoutData: BytesLike[] = payouts.map((payout) =>
    ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address", "uint256", "bytes32[]"],
      payout
    )
  );

  return encodedPayoutData;
}
