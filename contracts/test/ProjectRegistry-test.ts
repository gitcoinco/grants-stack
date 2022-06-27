import { ContractReceipt } from "ethers";
const hre = require("hardhat");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const testMetadata = { protocol: 1, pointer: "test-metadata" };
const updatedMetadata = { protocol: 1, pointer: "updated-metadata" };

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const OWNERS_LIST_SENTINEL = "0x0000000000000000000000000000000000000001";

describe("ProjectRegistry", function () {
  before(async function () {
    [this.owner, this.projectRecipient, this.nonOwner, ...this.accounts] =
      await ethers.getSigners();

    const ProjectRegistry = await hre.ethers.getContractFactory(
      "ProjectRegistry",
      this.owner
    );
    this.contract = await ProjectRegistry.deploy();
    await this.contract.deployed();
  });

  it("creates a new project and adds it to the projects list", async function () {
    expect(await this.contract.projectsCount()).to.equal("0");

    await this.contract.createProject(
      this.projectRecipient.address,
      testMetadata
    );

    expect(await this.contract.projectsCount()).to.equal("1");

    const project = await this.contract.projects(0);
    expect(project.id).to.equal("0");
    expect(project.recipient).to.equal(this.projectRecipient.address);

    const [protocol, pointer] = project.metadata;
    expect(protocol).to.equal(testMetadata.protocol);
    expect(pointer).to.equal(testMetadata.pointer);

    const owners = await this.contract.getProjectOwners(project.id);
    expect(owners.length).to.equal(1);
    expect(owners[0]).to.equal(this.owner.address);
  });

  it("does not allow update of project metadata if not owner", async function () {
    const project = await this.contract.projects(0);
    await expect(
      this.contract
        .connect(this.nonOwner)
        .updateProjectMetadata(project.id, updatedMetadata)
    ).to.be.revertedWith("not owner");
  });

  it("updates project metadata", async function () {
    const project = await this.contract.projects(0);
    await this.contract.updateProjectMetadata(project.id, updatedMetadata);
    const updatedProject = await this.contract.projects(0);
    const [protocol, pointer] = updatedProject.metadata;
    expect(protocol).to.equal(updatedMetadata.protocol);
    expect(pointer).to.equal(updatedMetadata.pointer);
  });

  it("does not allow to add an owner if not owner", async function () {
    const projectID = 0;
    await expect(
      this.contract
        .connect(this.nonOwner)
        .addProjectOwner(projectID, this.nonOwner.address)
    ).to.be.revertedWith("not owner");
  });

  it("emits AddedOwner and RemovedOwner when owner events", async function () {
    const projectID = 0;
    const addTx = await this.contract
      .connect(this.owner)
      .addProjectOwner(projectID, this.accounts[1].address);

    const { events: addEvents } = await addTx.wait();
    const addOwner = addEvents[0].args.owner;
    expect(addOwner).to.equal(this.accounts[1].address);
    expect(addEvents[0].event).to.equal("AddedOwner");

    const removeTx = await this.contract
      .connect(this.owner)
      .removeProjectOwner(
        projectID,
        OWNERS_LIST_SENTINEL,
        this.accounts[1].address
      );

    const { events } = await removeTx.wait();
    const [owner] = events[0].args;
    expect(owner).to.equal(this.accounts[1].address);
    expect(events[0].event).to.equal("RemovedOwner");
  });

  it("adds owner to project", async function () {
    const projectID = 0;

    expect(await this.contract.projectOwnersCount(projectID)).to.equal("1");
    const prevOwners = await this.contract.getProjectOwners(projectID);
    expect(prevOwners.length).to.equal(1);
    expect(prevOwners[0]).to.equal(this.owner.address);

    for (let i = 0; i < 3; i++) {
      await this.contract
        .connect(this.owner)
        .addProjectOwner(projectID, this.accounts[i].address);
    }

    expect(await this.contract.projectOwnersCount(projectID)).to.equal("4");
    const owners = await this.contract.getProjectOwners(projectID);
    expect(owners.length).to.equal(4);
    expect(owners[0]).to.equal(this.accounts[2].address);
    expect(owners[1]).to.equal(this.accounts[1].address);
    expect(owners[2]).to.equal(this.accounts[0].address);
    expect(owners[3]).to.equal(this.owner.address);
  });

  it("does not allow to remove an owner if not owner", async function () {
    const projectID = 0;
    await expect(
      this.contract
        .connect(this.nonOwner)
        .removeProjectOwner(projectID, this.owner.address, this.owner.address)
    ).to.be.revertedWith("not owner");
  });

  it("does not allow to remove owner 0", async function () {
    const projectID = 0;
    await expect(
      this.contract
        .connect(this.owner)
        .removeProjectOwner(projectID, this.owner.address, ZERO_ADDRESS)
    ).to.be.revertedWith("bad owner");
  });

  it("does not allow to remove owner equal to OWNERS_LIST_SENTINEL", async function () {
    const projectID = 0;
    await expect(
      this.contract
        .connect(this.owner)
        .removeProjectOwner(projectID, this.owner.address, OWNERS_LIST_SENTINEL)
    ).to.be.revertedWith("bad owner");
  });

  it("does not allow to remove owner with bad prevOwner", async function () {
    const projectID = 0;
    await expect(
      this.contract
        .connect(this.owner)
        .removeProjectOwner(
          projectID,
          this.nonOwner.address,
          this.owner.address
        )
    ).to.be.revertedWith("bad prevOwner");
  });

  it("removes owner", async function () {
    const projectID = 0;
    const currentOwners = await this.contract.getProjectOwners(projectID);

    expect(await this.contract.projectOwnersCount(projectID)).to.equal("4");
    const owners = await this.contract.getProjectOwners(projectID);
    expect(owners.length).to.equal(4);
    expect(currentOwners[0]).to.equal(this.accounts[2].address);
    expect(currentOwners[1]).to.equal(this.accounts[1].address);
    expect(currentOwners[2]).to.equal(this.accounts[0].address);
    expect(currentOwners[3]).to.equal(this.owner.address);

    await this.contract
      .connect(this.owner)
      .removeProjectOwner(
        projectID,
        this.accounts[1].address,
        this.accounts[0].address
      );
    expect(await this.contract.projectOwnersCount(projectID)).to.equal("3");
    let newOwners = await this.contract.getProjectOwners(projectID);
    expect(newOwners.length).to.equal(3);

    await this.contract
      .connect(this.owner)
      .removeProjectOwner(
        projectID,
        this.accounts[1].address,
        this.owner.address
      );
    expect(await this.contract.projectOwnersCount(projectID)).to.equal("2");
    newOwners = await this.contract.getProjectOwners(projectID);
    expect(newOwners.length).to.equal(2);

    await this.contract
      .connect(this.accounts[2])
      .removeProjectOwner(
        projectID,
        OWNERS_LIST_SENTINEL,
        this.accounts[2].address
      );

    expect(await this.contract.projectOwnersCount(projectID)).to.equal("1");
    newOwners = await this.contract.getProjectOwners(projectID);
    expect(newOwners.length).to.equal(1);
    expect(newOwners[0]).to.eq(this.accounts[1].address);
  });

  it("does not allow to remove owner if single owner", async function () {
    const projectID = 0;
    expect(await this.contract.projectOwnersCount(projectID)).to.equal("1");
    const currentOwners = await this.contract.getProjectOwners(projectID);
    expect(currentOwners[0]).to.eq(this.accounts[1].address);

    await expect(
      this.contract
        .connect(this.accounts[1])
        .removeProjectOwner(
          projectID,
          OWNERS_LIST_SENTINEL,
          this.accounts[1].address
        )
    ).to.be.revertedWith("single owner");
  });
});
