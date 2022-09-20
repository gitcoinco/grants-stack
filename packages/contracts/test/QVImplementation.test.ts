import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { isAddress } from "ethers/lib/utils";
import { artifacts, ethers } from "hardhat";
import { Artifact } from "hardhat/types";
import { QVImplementation, VoterRegister } from "../typechain";
import { BigNumber, utils } from "ethers";

describe("QVImplementation", function () {
  let user0: SignerWithAddress;
  let user1: SignerWithAddress;
  let QVImplementation: QVImplementation;
  let QVImplementationArtifact: Artifact;
  let VoterRegisterArtifact: Artifact;
  let VoterRegister: VoterRegister;
  const encoder = new utils.AbiCoder();

  const encodeParameters = (
    _voteCredits: number,
    _voterRegister: string,
    _adminRoles: string[],
    _roundOperators: string[]
  ): string => {
    return encoder.encode(
      ["tuple(uint256, address, address[], address[])"],
      [[_voteCredits, _voterRegister, _adminRoles, _roundOperators]]
    );
  };

  const encodeVote = (grantID: string, voteCredits: number): string => {
    return encoder.encode(
      ["tuple(bytes32, uint256)"],
      [[grantID, voteCredits]]
    );
  };

  describe("constructor", () => {
    it("deploys properly", async () => {
      [user0, user1] = await ethers.getSigners();

      QVImplementationArtifact = await artifacts.readArtifact(
        "QVImplementation"
      );
      QVImplementation = <QVImplementation>(
        await deployContract(user0, QVImplementationArtifact, [])
      );

      // Verify deploy
      // eslint-disable-next-line no-unused-expressions
      expect(
        isAddress(QVImplementation.address),
        "Failed to deploy QVImplementation"
      ).to.be.true;
    });
  });

  describe("core functions", () => {
    before(async () => {
      [user0, user1] = await ethers.getSigners();

      // Deploy QVImplementation contract
      QVImplementationArtifact = await artifacts.readArtifact(
        "QVImplementation"
      );
      QVImplementation = <QVImplementation>(
        await deployContract(user0, QVImplementationArtifact, [])
      );

      VoterRegisterArtifact = await artifacts.readArtifact("VoterRegister");
      VoterRegister = <VoterRegister>(
        await deployContract(user0, VoterRegisterArtifact, [
          "TEST",
          "TEST",
          "TEST",
        ])
      );

      const encodedParams = encodeParameters(
        100,
        VoterRegister.address,
        [user0.address],
        [user0.address]
      );
      QVImplementation.initialize(encodedParams);
    });

    describe("test: vote", () => {
      it("should allow a minted user to vote", () => {
        // mint the voter register
        VoterRegister.mint(user0.address);

        const encodedVotes = [
          encodeVote(
            "0x657468657265756d000000000000000000000000000000000000000000000000",
            10
          ),
          encodeVote(
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            4
          ),
        ];
        QVImplementation.vote(encodedVotes, user0.address);
      });
      it("should prevent unregistered users from voting", () => {
        const encodedVotes = [
          encodeVote(
            "0x657468657265756d000000000000000000000000000000000000000000000000",
            10
          ),
        ];
        expect(QVImplementation.vote(encodedVotes, user1.address)).to.be
          .reverted;
      });
      it("should emit an event on vote", async () => {
        // mint the voter register
        VoterRegister.mint(user1.address);

        const encodedVotes = [
          encodeVote(
            "0x657468657265756d000000000000000000000000000000000000000000000000",
            16
          ),
        ];
        expect(QVImplementation.vote(encodedVotes, user1.address))
          .to.emit(QVImplementation, "Voted")
          .withArgs(
            user1.address,
            "0x657468657265756d000000000000000000000000000000000000000000000000",
            BigNumber.from(16),
            BigNumber.from(4)
          );
      });
    });

    describe("test: tally", () => {
      it("should tally the votes", async () => {
        expect(QVImplementation.tally()).to.emit(QVImplementation, "Tallied");
        // TODO: check that the votes were tallied correctly
      });
    });
  });
});
