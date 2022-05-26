const hre = require("hardhat");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const testMetadata =  { protocol: 1, pointer: "test-metadata" };
const updatedMetadata =  { protocol: 1, pointer: "updated-metadata" };

describe("ProjectRegistry", function () {
  before(async function () {
    [this.owner, this.projectRecipient, ...this.accounts] = await ethers.getSigners();

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
      testMetadata,
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

  // it("updates project metadata", async function () {
  //   const project = await this.contract.projects(0);
  //   expect(project.metadata).to.equal(testMetadata);

  //   await this.contract.updateMetadata(project.id, updatedMetadata);
  //   const updatedProject = await this.contract.projects(0);
  //   expect(updatedProject.metadata).to.equal(updatedMetadata);
  // });
});
