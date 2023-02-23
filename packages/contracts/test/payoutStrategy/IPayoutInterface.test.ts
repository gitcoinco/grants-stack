import { AddressZero } from "@ethersproject/constants";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract, MockContract } from "ethereum-waffle";
import { Wallet } from "ethers";
import { isAddress } from "ethers/lib/utils";
import { artifacts, ethers, upgrades } from "hardhat";
import { Artifact } from "hardhat/types";
import { encodeRoundParameters } from "../../scripts/utils";
import { MerklePayoutStrategyImplementation, MockERC20, QuadraticFundingVotingStrategyImplementation, RoundFactory, RoundFactory__factory, RoundImplementation } from "../../typechain";

describe("IPayoutInterface", function () {

  let user: SignerWithAddress;

  // Round Factory
  let roundContractFactory: RoundFactory__factory;
  let roundFactoryContract: RoundFactory;

  // Round Implementation
  let roundImplementation: RoundImplementation;
  let roundImplementationArtifact: Artifact;

  // Voting Strategy
  let votingStrategyContract: QuadraticFundingVotingStrategyImplementation;
  let votingStrategyArtifact: Artifact;

  // MerklePayoutStrategy Implementation
  let merklePayoutStrategy: MerklePayoutStrategyImplementation;
  let merklePayoutStrategyArtifact: Artifact;

  // MockERC20
  let mockERC20: MockERC20;
  let mockERC20Artifact: Artifact;


  const VERSION = "0.2.0";


  before(async () => {
    [user] = await ethers.getSigners();

    // Deploy RoundFactory contract
    roundContractFactory = await ethers.getContractFactory('RoundFactory');
    roundFactoryContract = <RoundFactory>await upgrades.deployProxy(roundContractFactory);

    // Deploy MerklePayoutStrategyImplementation
    merklePayoutStrategyArtifact = await artifacts.readArtifact('MerklePayoutStrategyImplementation');
    merklePayoutStrategy = <MerklePayoutStrategyImplementation>await deployContract(user, merklePayoutStrategyArtifact, []);

    roundImplementationArtifact = await artifacts.readArtifact('RoundImplementation');

  })

  describe ('constructor', () => {

    it('SHOULD deploy properly', async () => {

      // Verify deploy
      expect(isAddress(merklePayoutStrategy.address), 'Failed to deploy MerklePayoutStrategyImplementation').to.be.true;
    });
  });

  let _currentBlockTimestamp: number;

  describe ('IPayoutInterface functions', () => {

    const initPayoutStrategy = async (
      _currentBlockTimestamp: number,
      payoutStrategyContract: MerklePayoutStrategyImplementation,
      overrides?: any
    ) => {

      // Deploy MockERC20 contract if _token is not provided
      mockERC20Artifact = await artifacts.readArtifact('MockERC20');
      mockERC20 = <MockERC20>await deployContract(user, mockERC20Artifact, [10000]);
      const token =  overrides && overrides.hasOwnProperty('token') ? overrides.token : mockERC20.address;

      const roundMetaPtr = { protocol: 1, pointer: "bafybeia4khbew3r2mkflyn7nzlvfzcb3qpfeftz5ivpzfwn77ollj47gqi" };
      const applicationMetaPtr = { protocol: 1, pointer: "bafybeiaoakfoxjwi2kwh43djbmomroiryvhv5cetg74fbtzwef7hzzvrnq" };

      const adminRoles = [ user.address ];
      const roundOperators = [
        user.address,
        Wallet.createRandom().address,
        Wallet.createRandom().address
      ];

      // Deploy RoundImplementation contract
      roundImplementationArtifact = await artifacts.readArtifact('RoundImplementation');
      roundImplementation = <RoundImplementation>await deployContract(user, roundImplementationArtifact, []);

      // Deploy voting strategy
      votingStrategyArtifact = await artifacts.readArtifact('QuadraticFundingVotingStrategyImplementation');
      votingStrategyContract = <QuadraticFundingVotingStrategyImplementation>await deployContract(user, votingStrategyArtifact, []);
      const matchAmount = 100;
      const roundFeePercentage = 10;
      const roundFeeAddress = Wallet.createRandom().address;

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

      const initMetaPtr = [
        roundMetaPtr,
        applicationMetaPtr,
      ];

      const initRoles = [
        adminRoles,
        roundOperators
      ];

      let params = [
        initAddress,
        initRoundTime,
        matchAmount,
        token,
        roundFeePercentage,
        roundFeeAddress,
        initMetaPtr,
        initRoles
      ];

      await roundImplementation.initialize(
        encodeRoundParameters(params),
        roundFactoryContract.address
      );
      
      return params;
    };

    describe('test: init', () => {

      before(async () => {
        [user] = await ethers.getSigners();

        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        // Deploy MerklePayoutStrategyImplementation
        merklePayoutStrategyArtifact = await artifacts.readArtifact('MerklePayoutStrategyImplementation');
        merklePayoutStrategy = <MerklePayoutStrategyImplementation>await deployContract(user, merklePayoutStrategyArtifact, []);

        await initPayoutStrategy(_currentBlockTimestamp, merklePayoutStrategy);
      });

      it("SHOULD set the contract version", async() => {
        expect(await merklePayoutStrategy.VERSION()).to.equal(VERSION);
      });

      it("SHOULD set the round address", async() => {
        expect(await merklePayoutStrategy.roundAddress()).to.equal(roundImplementation.address);
      });

      it("SHOULD revert WHEN invoked more than once", async() => {
        const tx = merklePayoutStrategy.init();
        await expect(tx).to.revertedWith('roundAddress already set');
      });
    });

    describe('test: setReadyForPayout', () => {

      beforeEach(async () => {

        // update protocol treasury
        let protocolTreasury = Wallet.createRandom().address;
        await roundFactoryContract.updateProtocolTreasury(protocolTreasury);
                  
        [user] = await ethers.getSigners();

        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        // Deploy MerklePayoutStrategyImplementation
        merklePayoutStrategyArtifact = await artifacts.readArtifact('MerklePayoutStrategyImplementation');
        merklePayoutStrategy = <MerklePayoutStrategyImplementation>await deployContract(user, merklePayoutStrategyArtifact, []);
      });
      
      it("SHOULD revert if invoked when roundAddress is not set", async() => {
        const tx = merklePayoutStrategy.setReadyForPayout();
        await expect(tx).to.revertedWith('not linked to a round');
      });

      it("SHOULD revert if not called by Round", async () => {
        await initPayoutStrategy(_currentBlockTimestamp, merklePayoutStrategy);

        const tx = merklePayoutStrategy.setReadyForPayout();
        await expect(tx).to.revertedWith('not invoked by round');
      });

      it("SHOULD revert if round has not ended", async () => {
        await initPayoutStrategy(_currentBlockTimestamp, merklePayoutStrategy);

        // transfer some tokens to roundImplementation
        await mockERC20.transfer(roundImplementation.address, 110);

        const tx = roundImplementation.setReadyForPayout();
        await expect(tx).to.revertedWith('Round: Round has not ended');
      });

      it("SHOULD set isReadyForPayout as true", async() => {
        await initPayoutStrategy(_currentBlockTimestamp, merklePayoutStrategy);

        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 1300]);

        // transfer some tokens to roundImplementation
        await mockERC20.transfer(roundImplementation.address, 110);

        await roundImplementation.setReadyForPayout();

        expect(await merklePayoutStrategy.isReadyForPayout()).to.equal(true);
      });

      it("SHOULD emit ReadyForPayout event", async() => {
        await initPayoutStrategy(_currentBlockTimestamp, merklePayoutStrategy);

        // transfer some tokens to roundImplementation
        await mockERC20.transfer(roundImplementation.address, 110);
        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 1300])

        // set isReadyForPayout as true
        const tx = roundImplementation.setReadyForPayout();

        await expect(tx).to.emit(merklePayoutStrategy, 'ReadyForPayout');
      });

      it("SHOULD revert if isReadyForPayout is already true", async() => {
        await initPayoutStrategy(_currentBlockTimestamp, merklePayoutStrategy);

        // transfer some tokens to roundImplementation
        await mockERC20.transfer(roundImplementation.address, 110);
        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 1300])

        // set isReadyForPayout as true
        await roundImplementation.setReadyForPayout();

        // try to set isReadyForPayout as true again
        await mockERC20.transfer(roundImplementation.address, 110);
        const tx = roundImplementation.setReadyForPayout(); 
  
        await expect(tx).to.revertedWith('isReadyForPayout already set');
      });

    });

    describe('test: withdrawFunds', () => {

      let params: any;

      const LOCK_DURATION = 5185000; // 60 days

      beforeEach(async () => {
        [user] = await ethers.getSigners();

        _currentBlockTimestamp = (await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber())
        ).timestamp;

        // Deploy MerklePayoutStrategyImplementation
        merklePayoutStrategyArtifact = await artifacts.readArtifact('MerklePayoutStrategyImplementation');
        merklePayoutStrategy = <MerklePayoutStrategyImplementation>await deployContract(user, merklePayoutStrategyArtifact, []);

      });

      it("SHOULD revert WHEN invoked by not round operator", async() => {
        params = await initPayoutStrategy(_currentBlockTimestamp, merklePayoutStrategy);

        const [_, notRoundOperator] = await ethers.getSigners();
        const tx = merklePayoutStrategy.connect(notRoundOperator).withdrawFunds(Wallet.createRandom().address);        
        await expect(tx).to.revertedWith('not round operator');
      });

      it("SHOULD revert WHEN invoked before endLockingTime", async() => {
        params = await initPayoutStrategy(_currentBlockTimestamp, merklePayoutStrategy);

        const tx = merklePayoutStrategy.withdrawFunds(Wallet.createRandom().address);        
        await expect(tx).to.revertedWith('Lock duration has not ended');
      });

      it("SHOULD not revert WHEN invoked when the contract has no funds", async() => {
        params = await initPayoutStrategy(_currentBlockTimestamp, merklePayoutStrategy);

        // Mine Blocks
        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + LOCK_DURATION + 1200])

        const tx = merklePayoutStrategy.withdrawFunds(Wallet.createRandom().address);
        await expect(tx).to.not.reverted;
      });

      it("SHOULD transfer native funds WHEN invoked after endLockingTime", async() => {
        
        params = await initPayoutStrategy(_currentBlockTimestamp, merklePayoutStrategy, {
          token: AddressZero
        });

        // Mine Blocks
        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + LOCK_DURATION + 1200])

        // transfer funds to payout strategy
        await user.sendTransaction({
          to: merklePayoutStrategy.address,
          value: ethers.utils.parseEther("1.0"),
        });
        
        expect(await ethers.provider.getBalance(merklePayoutStrategy.address)).to.equal(ethers.utils.parseEther("1.0"));

        // withdraw funds
        const withdrawAddress = Wallet.createRandom().address;
        await merklePayoutStrategy.withdrawFunds(withdrawAddress);
        
        expect(await ethers.provider.getBalance(merklePayoutStrategy.address)).to.equal(0);
        expect(await ethers.provider.getBalance(withdrawAddress)).to.equal(ethers.utils.parseEther("1.0"));

      });

      it("SHOULD transfer ERC20 funds and emit event WHEN invoked after endLockingTime", async() => {

        const [_, withdrawAddress] = await ethers.getSigners();

        params = await initPayoutStrategy(_currentBlockTimestamp, merklePayoutStrategy, {});
        
        // Mine Blocks
        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + LOCK_DURATION + 1200])

        // transfer funds to payout strategy
        await mockERC20.transfer(merklePayoutStrategy.address, 10);

        // check balance on payout strategy
        expect(await mockERC20.balanceOf(merklePayoutStrategy.address)).to.equal(10);

        // withdraw funds
        await merklePayoutStrategy.withdrawFunds(withdrawAddress.address);

        // check balance on payout strategy & withdraw address
        expect(await mockERC20.balanceOf(merklePayoutStrategy.address)).to.equal(0);
        expect(await mockERC20.balanceOf(withdrawAddress.address)).to.equal(10);
      });

      it("SHOULD emit event WHEN invoked after endLockingTime", async() => {
        params = await initPayoutStrategy(_currentBlockTimestamp, merklePayoutStrategy);
        
        // Mine Blocks
        await ethers.provider.send("evm_mine", [_currentBlockTimestamp + LOCK_DURATION + 1200])

        // transfer funds to payout strategy
        await mockERC20.transfer(merklePayoutStrategy.address, 10);

        // check balance on payout strategy
        expect(await mockERC20.balanceOf(merklePayoutStrategy.address)).to.equal(10);

        // withdraw funds
        const withdrawAddress = Wallet.createRandom().address;
        const tx = merklePayoutStrategy.withdrawFunds(withdrawAddress);        

        await expect(tx).to.emit(
          merklePayoutStrategy, 'FundsWithdrawn'
        ).withArgs(
          mockERC20.address,
          10,
          withdrawAddress
        );
      });

    });
  });
})