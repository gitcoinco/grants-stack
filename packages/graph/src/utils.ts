import { crypto } from '@graphprotocol/graph-ts'
import { ByteArray } from '@graphprotocol/graph-ts';

/**
 * Returns keccak256 of array after elements are joined by '-'
 * @param Array<String>
 * @returns keccak256
 */
export function generateID(array: Array<string>): string {
  return crypto.keccak256(
    ByteArray.fromHexString(array.join('-'))
  ).toBase58();
}