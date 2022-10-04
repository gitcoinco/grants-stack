import { log, store } from "@graphprotocol/graph-ts";

import {
  MetadataUpdated as MetadataUpdatedEvent,
  OwnerAdded as OwnerAddedEvent,
  OwnerRemoved as OwnerRemovedEvent,
  ProjectCreated as ProjectCreatedEvent,
} from "../../generated/ProjectRegistry/ProjectRegistry";

import {
  Account,
  AccountProject,
  MetaPtr,
  Project,
} from "../../generated/schema";
import { generateID } from "../utils";

export function handleProjectCreated(event: ProjectCreatedEvent): void {
  log.debug("handleProjectCreated: {}", [event.params.projectID.toString()]);

  let project = new Project(event.params.projectID.toHexString());
  project.save();

  let account = Account.load(event.params.owner.toHexString());

  if (account === null) {
    log.debug("handleProjectCreated - new account", []);
    account = new Account(event.params.owner.toHexString());
    account.address = event.params.owner.toHex();
    account.save();
  }

  let accountProject = new AccountProject(
    generateID([project.id, account.address])
  );
  accountProject.account = account.id;
  accountProject.project = project.id;
  accountProject.save();
}

export function handleMetadataUpdated(event: MetadataUpdatedEvent): void {
  log.debug("handleMetadataUpdated: {}", [event.params.projectID.toString()]);
  let project = Project.load(event.params.projectID.toHexString());

  if (project === null) {
    log.critical("handleMetadataUpdated - project {} not found", [
      event.params.projectID.toHexString(),
    ]);
    return;
  }

  let metaPtr = new MetaPtr(event.params.projectID.toHexString());
  metaPtr.protocol = event.params.metaPtr.protocol;
  metaPtr.pointer = event.params.metaPtr.pointer;
  metaPtr.save();

  project.metaPtr = metaPtr.id;
  project.save();
}

export function handleOwnerAdded(event: OwnerAddedEvent): void {
  log.debug("handleOwnerAdded: {} - ", [
    event.params.projectID.toString(),
    event.params.owner.toHexString(),
  ]);
  let account = Account.load(event.params.owner.toHexString());

  if (account === null) {
    log.debug("handleOwnerAdded - new account", []);
    account = new Account(event.params.owner.toHexString());
    account.address = event.params.owner.toHex();
    account.save();
  }

  let project = Project.load(event.params.projectID.toHexString());

  if (project === null) {
    log.critical("handleOwnerAdded - project {} not found", [
      event.params.projectID.toHexString(),
    ]);
    return;
  }

  let accountProject = new AccountProject(
    generateID([project.id, account.address])
  );
  accountProject.account = account.id;
  accountProject.project = project.id;
  accountProject.save();
}

export function handleOwnerRemoved(event: OwnerRemovedEvent): void {
  let account = Account.load(event.params.owner.toHexString());

  if (account === null) {
    log.critical("handleOwnerRemoved - account {} not found", [
      event.params.owner.toHexString(),
    ]);
    return;
  }

  let project = Project.load(event.params.projectID.toHexString());

  if (project === null) {
    log.critical("handleOwnerRemoved - project {} not found", [
      event.params.projectID.toHexString(),
    ]);
    return;
  }

  let accountProject = AccountProject.load(
    generateID([project.id, account.address])
  );

  if (accountProject === null) {
    log.critical("handleOwnerRemoved - AccountProject {} not found", [
      generateID([project.id, account.address]),
    ]);
    return;
  }

  store.remove("AccountProject", accountProject.id);
}
