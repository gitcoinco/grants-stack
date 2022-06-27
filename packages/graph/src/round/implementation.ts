import {
  NewProjectApplication as NewProjectApplicationEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent
} from "../../generated/templates/RoundImplementation/RoundImplementation";

import {
  MetaPtr,
  Round,
  RoundAccount,
  RoundRole,
  RoundProject
} from "../../generated/schema";
import { generateID } from "../utils";
import { store } from '@graphprotocol/graph-ts';


// @dev: Enum for different states a project application can be in
// enum ProjectApplicationStatus = {
//   PENDING   = "PENDING",
//   APPROVED  = "APPROVED",
//   REJECTED  = "REJECTED",
//   APPEAL    = "APPEAL"
// };


/**
 * @dev Handles indexing on RoleGranted event.
 * @param event RoleGrantedEvent
 */
export function handleRoleGranted(event: RoleGrantedEvent): void {
  const _round = event.address.toHex();
  const _role = event.params.role.toHex();
  const _account= event.params.account.toHex();

  // round
  let round = Round.load(_round);
  round = round == null ? new Round(_round) : round;

  // role
  const roleID = [_round, _role].join('-');
  let role = RoundRole.load(roleID);
  role = role == null ? new RoundRole(roleID) : role;

  role.role = _role;
  role.round = round.id;

  role.save();

  // account
  const accountId = generateID([_round, _role, _account]);
  let account = RoundAccount.load(accountId);
  account = account == null ? new RoundAccount(accountId) : account;

  account.address = _account;
  account.role = role.id;
  account.round = round.id;

  account.save();
}


/**
 * @dev Handles indexing on RoleRevoked event.
 * @param event RoleRevokedEvent
 */
export function handleRoleRevoked(event: RoleRevokedEvent): void {
  const _round = event.address.toHex();
  const _role = event.params.role.toHex();
  const _account= event.params.account.toHex();

  // round
  let round = Round.load(_round);
  round = round == null ? new Round(_round) : round;

  // role
  const roleID = [_round, _role].join('-');
  let role = RoundRole.load(roleID);
  role = role == null ? new RoundRole(roleID) : role;

  // account
  const accountId =  generateID([_round, _role, _account]);
  let account = RoundAccount.load(accountId)
  if (account) {
    store.remove('ProgramAccount', account.id);
  }
}

/**
 * Handles indexing on NewProjectApplicationEvent event.
 * - creates RoundProject entity
 * - links RoundProject to Round
 * - create MetaPtr entity and links to RoundProject
 *
 * @param event NewProjectApplicationEvent
 */
export function handleNewProjectApplication(event: NewProjectApplicationEvent): void {
  const _round = event.address.toHex();
  const _project = event.params.project.toHex();
  const _metaPtr = event.params.applicationMetaPtr;

  const projectId = [_project, _round].join('-');

  // use projectId as metadataId
  const metaPtrId = projectId;

  // load Round entity
  let round = Round.load(_round);
  round = round == null ? new Round(_round) : round;

  // create new MetaPtr entity
  let metaPtr = MetaPtr.load(metaPtrId);
  metaPtr = metaPtr == null ? new MetaPtr(metaPtrId) : metaPtr;
  metaPtr.protocol =  _metaPtr[0].toI32() ;
  metaPtr.pointer = _metaPtr[1].toString();
  metaPtr.save()


  // create new RoundProject entity
  let project = RoundProject.load(projectId)
  project = project == null ? new RoundProject(projectId) : project;

  //  RoundProject
  project.round = round.id;
  project.metaPtr = metaPtr.id;
  project.status = "PENDING";
  project.save();
}