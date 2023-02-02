import {
  clearStore,
  test,
  assert,
  newMockEvent,
} from "matchstick-as/assembly/index";
import { Address, ethereum } from "@graphprotocol/graph-ts";
import {
  Project,
  Account,
  AccountProject,
  MetaPtr,
} from "../../generated/schema";
import {
  handleMetadataUpdated,
  handleOwnerAdded,
  handleOwnerRemoved,
  handleProjectCreated,
} from "../../src/projectregistry/implementation";
import {
  ProjectCreated as ProjectCreatedEvent,
  MetadataUpdated as MetadataUpdatedEvent,
  OwnerAdded as OwnerAddedEvent,
  OwnerRemoved as OwnerRemovedEvent,
} from "../../generated/ProjectRegistry/ProjectRegistry";

export function runTests(): void {
  test("Create Project", () => {});
}
