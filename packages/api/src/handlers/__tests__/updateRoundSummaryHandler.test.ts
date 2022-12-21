import { Response } from "express";
import { faker } from "@faker-js/faker";
import { getMockReq } from "@jest-mock/express";

import { HandleResponseObject, QFContributionSummary } from "../../types";
import * as utils from "../../utils";
import * as linearQuadraticFunding from "../../votingStrategies/linearQuadraticFunding";

import {
  mockRoundMetadata,
  mockQFContributionSummary,
  mockQFVote,
} from "../../test-utils";
import {
  getRoundSummary,
  updateRoundSummaryHandler,
} from "../updateRoundSummaryHandler";
import { prismaMock } from "../singleton";

const SECONDS = 1000;
jest.setTimeout(70 * SECONDS);

describe("updateRoundSummaryHandler", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const chainId = "3";
  const roundId = faker.finance.ethereumAddress.toString();
  const projectId = faker.finance.ethereumAddress.toString();

  const req = getMockReq({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    params: {
      chainId: chainId,
      roundId: roundId,
    },
  });
  const res = {
    send: jest.fn(),
    json: (object: any) => {
      return object;
    },
  } as unknown as Response;

  it("returns error when invoked no params", async () => {
    const req = getMockReq({ params: {} });

    const responseJSON = (await updateRoundSummaryHandler(
      req,
      res
    )) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual(
      "error: missing parameter chainId or roundId"
    );
    expect(responseJSON.data).toEqual({});
  });

  it("returns error when invoked without roundId", async () => {
    const req = getMockReq({
      params: {
        roundId: roundId,
      },
    });

    const responseJSON = (await updateRoundSummaryHandler(
      req,
      res
    )) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual(
      "error: missing parameter chainId or roundId"
    );
    expect(responseJSON.data).toEqual({});
  });

  it("returns error when invoked without chainId", async () => {
    const req = getMockReq({
      params: {
        chainId: chainId,
      },
    });

    const responseJSON = (await updateRoundSummaryHandler(
      req,
      res
    )) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual(
      "error: missing parameter chainId or roundId"
    );
    expect(responseJSON.data).toEqual({});
  });

  it("returns error when invoked with unsupported votingStrategy", async () => {
    // mock fetchRoundMetadata call to return data with random votingStrategy name
    const roundMetadata = JSON.parse(JSON.stringify(mockRoundMetadata));
    roundMetadata.votingStrategy.strategyName = faker.name.firstName();

    jest
      .spyOn(utils, "fetchRoundMetadata")
      .mockResolvedValueOnce(roundMetadata);
    const responseJSON = (await updateRoundSummaryHandler(
      req,
      res
    )) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: something went wrong");
  });

  it("returns error when exception occurs ", async () => {
    const responseJSON = (await updateRoundSummaryHandler(
      req,
      res
    )) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: something went wrong");
  });

  it("returns default response when round has no contributions", async () => {
    const roundMetadata = JSON.parse(JSON.stringify(mockRoundMetadata));
    jest
      .spyOn(utils, "fetchRoundMetadata")
      .mockResolvedValueOnce(roundMetadata);

    jest
      .spyOn(linearQuadraticFunding, "fetchQFContributionsForRound")
      .mockResolvedValueOnce([]);

    const timestamps = {
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    const defaultSummary = {
      contributionCount: 0,
      uniqueContributors: 0,
      totalContributionsInUSD: 0,
      averageUSDContribution: 0,
    };

    jest.spyOn(prismaMock.round, "upsert").mockResolvedValue({
      id: 1,
      chainId: utils.getChainVerbose(chainId),
      roundId,
      votingStrategyName: "LINEAR_QUADRATIC_FUNDING",
      isSaturated: false,
      ...timestamps,
    });

    jest.spyOn(prismaMock.roundSummary, "upsert").mockResolvedValue({
      ...defaultSummary,
      id: 1,
      roundId,
      ...timestamps,
    });

    const responseJSON = (await updateRoundSummaryHandler(
      req,
      res
    )) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeTruthy();
    expect(responseJSON.message).toEqual(req.originalUrl);
    expect(responseJSON.data).toEqual({
      ...defaultSummary,
      updatedAt: timestamps.updatedAt,
    } as QFContributionSummary);
  });

  it("returns successful response when round has 2 contributions", async () => {
    jest.setTimeout(100000);

    const roundMetadata = JSON.parse(JSON.stringify(mockRoundMetadata));
    jest
      .spyOn(utils, "fetchRoundMetadata")
      .mockResolvedValueOnce(roundMetadata);

    const qfContribution = JSON.parse(JSON.stringify(mockQFVote));
    jest
      .spyOn(linearQuadraticFunding, "fetchQFContributionsForRound")
      .mockResolvedValueOnce([qfContribution]);

    const summary = JSON.parse(JSON.stringify(mockQFContributionSummary));
    jest
      .spyOn(linearQuadraticFunding, "summarizeQFContributions")
      .mockResolvedValueOnce(summary);

    const timestamps = {
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    jest.spyOn(prismaMock.round, "upsert").mockResolvedValue({
      id: 1,
      chainId: utils.getChainVerbose(chainId),
      roundId,
      votingStrategyName: "LINEAR_QUADRATIC_FUNDING",
      isSaturated: false,
      ...timestamps,
    });

    jest.spyOn(prismaMock.roundSummary, "upsert").mockResolvedValue({
      ...summary,
      id: 1,
      roundId,
      ...timestamps,
    });

    const responseJSON = (await updateRoundSummaryHandler(
      req,
      res
    )) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeTruthy();
    expect(responseJSON.message).toEqual(req.originalUrl);
    expect(responseJSON.data).toEqual({
      ...summary,
      updatedAt: timestamps.updatedAt,
    } as QFContributionSummary);
  });
});
