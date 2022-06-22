import { crypto } from '@graphprotocol/graph-ts'
import { ByteArray } from '@graphprotocol/graph-ts';

export function generateID(array: Array<string>): string {
  return crypto.keccak256(
    ByteArray.fromHexString(array.join('-'))
  ).toBase58();
}