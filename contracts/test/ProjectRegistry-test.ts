const hre = require("hardhat");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const testMetadata = { protocol: 1, pointer: "test-metadata" };
const updatedMetadata = { protocol: 1, pointer: "updated-metadata" };

describe("ProjectRegistry", function () {
  before(async function () {
    [this.owner, this.projectRecipient, this.nonOwner, ...this.accounts] = await ethers.getSigners();

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

    const owners = await this.contract.getOwners(project.id);
    expect(owners.length).to.equal(1);
    expect(owners[0]).to.equal(this.owner.address);
  });

  it("does not allow update of project metadata if not owner", async function () {
    const project = await this.contract.projects(0);
    await expect(
      this.contract.connect(this.nonOwner).updateProjectMetaData(project.id, updatedMetadata)
    ).to.be.revertedWith("not owner");
  });

  it("updates project metadata", async function () {
    const project = await this.contract.projects(0);
    await this.contract.updateProjectMetaData(project.id, updatedMetadata);
    const updatedProject = await this.contract.projects(0);
    const [protocol, pointer] = updatedProject.metadata;
    expect(protocol).to.equal(updatedMetadata.protocol);
    expect(pointer).to.equal(updatedMetadata.pointer);
  });

  it("does not allow to add an owner if not owner", async function () {
    const projectID = 0;
    const currentOwners = await this.contract.getOwners(projectID);
    const lastOwner = currentOwners[currentOwners.length - 1];
    await expect(
      this.contract.connect(this.nonOwner).addProjectOwner(projectID, this.nonOwner.address)
    ).to.be.revertedWith("not owner");
  });

  it("adds owner to project", async function () {
    const projectID = 0;

    expect(await this.contract.projectOwnersCount(projectID)).to.equal("1");
    const prevOwners = await this.contract.getOwners(projectID);
    expect(prevOwners.length).to.equal(1);
    expect(prevOwners[0]).to.equal(this.owner.address);

    for (let i = 0; i < 3; i++) {
      await this.contract.connect(this.owner).addProjectOwner(projectID, this.accounts[i].address)
    }

    expect(await this.contract.projectOwnersCount(projectID)).to.equal("4");
    const owners = await this.contract.getOwners(projectID);
    expect(owners.length).to.equal(4);
    expect(owners[0]).to.equal(this.accounts[2].address);
    expect(owners[1]).to.equal(this.accounts[1].address);
    expect(owners[2]).to.equal(this.accounts[0].address);
    expect(owners[3]).to.equal(this.owner.address);
  });
});
