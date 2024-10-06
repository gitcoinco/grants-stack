import { gql, request } from "graphql-request";
import { MintingAttestationIdsData } from "../types/attestations.types";

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
        attestationTxns(filter: { txnHash: { in: $transactionHashes } }) {
          txnHash
          attestationUid
          attestationChainId
        }
      }
    `;

    const response: { attestationTxns: MintingAttestationIdsData[] } =
      await request(this.gsIndexerEndpoint, query, {
        transactionHashes,
      });

    return response.attestationTxns;
  }
}
