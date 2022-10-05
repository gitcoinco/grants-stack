import {
  crypto,
  ipfs,
  json,
  JSONValue,
  ByteArray,
} from "@graphprotocol/graph-ts";
import { MetaPtr } from "../generated/schema";

/**
 * Returns keccak256 of array after elements are joined by '-'
 * @param Array<String>
 * @returns keccak256
 */
export function generateID(array: Array<string>): string {
  return crypto.keccak256(ByteArray.fromUTF8(array.join("-"))).toBase58();
}

/**
 * Updates MetaPtr if it exists, otherwise creates a new one and returns it
 * @param metaPtrId string
 * @param protocol i32
 * @param pointer string
 * @returns MetaPtr
 */
export function updateMetaPtr(
  metaPtrId: string,
  protocol: i32,
  pointer: string
): MetaPtr {
  // metaPtr
  let metaPtr = MetaPtr.load(metaPtrId);
  metaPtr = metaPtr == null ? new MetaPtr(metaPtrId) : metaPtr;

  // update metaPtr
  metaPtr.protocol = protocol;
  metaPtr.pointer = pointer;

  // save metaPtr
  metaPtr.save();

  return metaPtr;
}

/**
 * Returns metaPtr data based on protocol and pointer
 * @param protocol { number }
 * @param pointer { string }
 * @returns JSONValue
 */
export function fetchMetaPtrData(
  protocol: number,
  pointer: string
): JSONValue | null {
  let metaPtrData: JSONValue;
  if (protocol == 1) {
    const ipfsData = ipfs.cat(pointer);

    if (!ipfsData) return null;

    metaPtrData = json.fromBytes(ipfsData);
    return metaPtrData;
  }

  return null;
}
