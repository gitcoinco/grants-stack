import { 
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent
} from "../../generated/templates/RoundImplementation/RoundImplementation";

import { Round, RoundAccount, RoundRole } from "../../generated/schema";
import { generateID } from "../utils";
import { store } from '@graphprotocol/graph-ts';


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


export function handleRoleRevoked(event: RoleRevokedEvent): void {
  const _round = event.address.toHex();
  const _role = event.params.role.toHex();
  const _account= event.params.account.toHex();

  // round
  let round = Round.load(_round);
  round = round == null ? new Round(_round) : round;
  
  // role
  const roleID = _round + '-' + _role;
  let role = RoundRole.load(roleID);
  role = role == null ? new RoundRole(roleID) : role;

  // account
  const accountId =  generateID([_round, _role, _account]);
  let account = RoundAccount.load(accountId)
  if (account) {
    store.remove('ProgramAccount', account.id);
  }
}