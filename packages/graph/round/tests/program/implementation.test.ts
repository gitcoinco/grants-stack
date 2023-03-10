import { test, newMockEvent , createMockedFunction, describe, beforeEach, clearStore, afterEach, logStore, assert } from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { Program, ProgramRole, ProgramAccount } from "../../generated/schema";
import { handleRoleGranted, handleRoleRevoked } from "../../src/program/implementation";
import { 
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent
} from "../../generated/templates/ProgramImplementation/ProgramImplementation";
import { generateID } from "../../src/utils";

let newRoleGrantedEvent: RoleGrantedEvent;
let newRoleRevokedEvent: RoleRevokedEvent;

let program: Address;
let role: Bytes;
let account: Address;


function createNewRoleGrantedEvent(role: Bytes, account: Address, program: Address): RoleGrantedEvent {
  const newRoleGrantedEvent = changetype<RoleGrantedEvent>(newMockEvent());

  const roleParam = new ethereum.EventParam("role", ethereum.Value.fromBytes(role));
  const accountParam = new ethereum.EventParam("account", ethereum.Value.fromAddress(account));
  
  newRoleGrantedEvent.parameters.push(roleParam);
  newRoleGrantedEvent.parameters.push(accountParam);

  newRoleGrantedEvent.address = program;
  
  return newRoleGrantedEvent;
}

function createNewRoleRevokedEvent(role: Bytes, account: Address, program: Address): RoleRevokedEvent {
  const newRoleRevokedEvent = changetype<RoleRevokedEvent>(newMockEvent());

  const roleParam = new ethereum.EventParam("role", ethereum.Value.fromBytes(role));
  const accountParam = new ethereum.EventParam("account", ethereum.Value.fromAddress(account));

  newRoleRevokedEvent.parameters.push(roleParam);
  newRoleRevokedEvent.parameters.push(accountParam);

  newRoleRevokedEvent.address = program;
  
  return newRoleRevokedEvent;
}


describe("handleRoleGranted", () => {

  beforeEach(() => {

    role = Bytes.fromHexString("0xaa630204f2780b6f080cc77cc0e9c0a5c21e92eb0c6771e709255dd27d6de132");
    account = Address.fromString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2C");
    program = Address.fromString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2A");

    // Create ProgramRole entity
    let programEntity = new Program(program.toHex());
    programEntity.metaPtr = "programMetaPtr";
    programEntity.createdAt = new BigInt(10);
    programEntity.updatedAt = new BigInt(10);

    programEntity.save();

    newRoleGrantedEvent = createNewRoleGrantedEvent(
      role,
      account,
      program
    );

  })

  afterEach(() => {
    clearStore();
  })

  test("ProgramRole entity is created when handleRoleGranted is called", () => {
    
    handleRoleGranted(newRoleGrantedEvent);
    
    const programRoleId = [program.toHex(), role.toHex()].join('-');
    const programRoleEntity = ProgramRole.load(programRoleId)

    assert.assertNotNull(programRoleEntity);
  });

  test("ProgramAccount entity is created when handleRoleGranted is called", () => {
    
    handleRoleGranted(newRoleGrantedEvent);
    
    const programAccountId = generateID([
      program.toHex(),
      role.toHex(),
      account.toHex()
    ]);
    const programAccountEntity = ProgramAccount.load(programAccountId);

    assert.assertNotNull(programAccountEntity);
  });

  test("ProgramRole entity and ProgramAccount entity is linked to Program when handleRoleGranted is called", () => {
    handleRoleGranted(newRoleGrantedEvent);

    const programEntity = Program.load(program.toHex());
    const accounts = programEntity!.accounts.length;
    const roles = programEntity!.roles.length;

    assert.i32Equals(accounts, 1);
    assert.i32Equals(roles, 1);
  });
});