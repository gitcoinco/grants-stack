import { gql, request } from "graphql-request";
import { MintingAttestationIdsData } from "./types";

export class AttestationService {
  private gsIndexerEndpoint: string;

  constructor(gsIndexerEndpoint: string) {
    this.gsIndexerEndpoint = gsIndexerEndpoint;
  }

  async getMintingAttestationIdsByTransactionHash({
    transactionHashes,
  }: {
    transactionHashes: string[];
  }): Promise<MintingAttestationIdsData[]> {
    const query = gql`
      query getMintingAttestationIdsByTransactionHash(
        $transactionHashes: [String!]!
      ) {
        attestationTxns(where: { txnHash: { _in: $transactionHashes } }) {
          txnHash
          attestationUid
          attestationChainId
          attestation {
            metadata
            timestamp
          }
        }
      }
    `;

    const response: { attestationTxns: MintingAttestationIdsData[] } =
      await request(this.gsIndexerEndpoint, query, {
        transactionHashes,
      });

    return response.attestationTxns;
  }

  async getAttestationCount({
    attestationChainIds,
  }: {
    attestationChainIds: number[];
  }): Promise<number> {
    const query = gql`
      query getAttestationCount($attestationChainIds: [Int!]!) {
        attestations(where: { chainId: { _in: $attestationChainIds } }) {
          uid
        }
      }
    `;

    const response: { attestations: { uid: string }[] } = await request(
      this.gsIndexerEndpoint,
      query,
      {
        attestationChainIds,
      },
    );

    return response.attestations.length;
  }
}
