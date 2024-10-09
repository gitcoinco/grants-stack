import { describe, it, expect, vi } from "vitest";
import { request } from "graphql-request";
import { AttestationService } from "../AttestationService/AttestationService";
import {
  mockEmptyResponse,
  mockEmptyTransactionHashes,
  mockResponse,
  mockTransactionHashes,
} from "./mocks";

// Mock the request function from graphql-request
vi.mock("graphql-request", async () => {
  const actual = await vi.importActual("graphql-request");
  return {
    ...(actual ?? {}),
    request: vi.fn(), // Mock the request function
  };
});

describe("AttestationService", () => {
  const gsIndexerEndpoint = "http://mock-endpoint.com/graphql";
  const service = new AttestationService(gsIndexerEndpoint);

  it("should fetch and return minting attestation IDs", async () => {
    // Mock the request function to return the mock response
    (request as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const result = await service.getMintingAttestationIdsByTransactionHash({
      transactionHashes: mockTransactionHashes,
    });

    expect(request).toHaveBeenCalledWith(
      gsIndexerEndpoint,
      expect.any(String),
      {
        transactionHashes: mockTransactionHashes,
      },
    );
    expect(result).toEqual(mockResponse.attestationTxns);
  });

  it("should fetch and return an empty array if transactionHashes is an empty array", async () => {
    // Mock the request function to return the mock response
    (request as ReturnType<typeof vi.fn>).mockResolvedValue(mockEmptyResponse);

    const result = await service.getMintingAttestationIdsByTransactionHash({
      transactionHashes: mockEmptyTransactionHashes,
    });

    expect(request).toHaveBeenCalledWith(
      gsIndexerEndpoint,
      expect.any(String),
      {
        transactionHashes: mockEmptyTransactionHashes,
      },
    );
    expect(result).toEqual(mockEmptyResponse.attestationTxns);
  });
});
