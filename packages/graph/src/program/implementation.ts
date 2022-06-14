import { ByteArray, store } from '@graphprotocol/graph-ts';
import { crypto } from '@graphprotocol/graph-ts'
import { 
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent
} from "../../generated/templates/ProgramImplementation/ProgramImplementation";

import {
  Program,
  ProgramAccount,
  ProgramRole
} from "../../generated/schema";


function generateID(array: Array<string>): string {
  return crypto.keccak256(
    ByteArray.fromHexString(array.join('-'))
  ).toBase58();
}

/**
 * @dev Handles indexing on RoleGranted event.
 * @param event RoleGrantedEvent
 */
export function handleRoleGranted(event: RoleGrantedEvent): void {
  
  const _program = event.address.toHex();
  const _role = event.params.role.toHex();
  const _account= event.params.account.toHex();

  // program
  let program = Program.load(_program);
  program = program == null ? new Program(_program) : program;
  
  // role
  const roleID = [_program, _role].join('-');
  let role = ProgramRole.load(roleID);
  role = role == null ? new ProgramRole(roleID) : role;

  role.role = _role;
  role.program = program.id;

  role.save();

  // account
  const accountId =  generateID([_program, _role, _account]);
  let account = ProgramAccount.load(accountId);
  account = account == null ? new ProgramAccount(accountId) : account;

  account.address = _account;
  account.role = role.id;
  account.program = program.id;

  account.save();
}

/**
 * @dev Handles indexing on RoleRevoked event.
 * @param event RoleRevokedEvent
 */
export function handleRoleRevoked(event: RoleRevokedEvent): void {
  const _program = event.address.toHex();
  const _role = event.params.role.toHex();
  const _account= event.params.account.toHex();

  // program
  let program = Program.load(_program);
  program = program == null ? new Program(_program) : program;
  
  // role
  const roleID = _program + '-' + _role;
  let role = ProgramRole.load(roleID);
  role = role == null ? new ProgramRole(roleID) : role;

  // account
  const accountId =  generateID([_program, _role, _account]);
  let account = ProgramAccount.load(accountId)
  if (account) {
    store.remove('ProgramAccount', account.id);
  }
}