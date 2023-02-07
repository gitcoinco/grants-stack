import { faker } from "@faker-js/faker";
import { getMockReq } from "@jest-mock/express";
import { Response } from "express";
import {
  HandleResponseObject,
  QFContribution,
  RoundMetadata,
} from "../../types";
import * as utils from "../../utils";
import * as linearQuadraticFunding from "../../votingStrategies/linearQuadraticFunding";

import {
  mockQFContributionSummary,
  mockQFVote,
  mockRoundMetadata,
} from "../../test-utils";
import { prismaMock } from "../singleton";
import { updateProjectSummaryHandler } from "../updateProjectSummaryHandler";

import failOnConsole from "jest-fail-on-console";

failOnConsole();

const SECONDS = 1000;
jest.setTimeout(70 * SECONDS);

describe("updateProjectSummaryHandler", () => {
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
      projectId: projectId,
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

    const responseJSON = (await updateProjectSummaryHandler(
      req,
      res
    )) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual(
      "error: missing parameter chainId, roundId, or projectId"
    );
    expect(responseJSON.data).toEqual({});
  });

  it("returns error when invoked without roundId", async () => {
    const req = getMockReq({
      params: {
        roundId: roundId,
      },
    });

    const responseJSON = (await updateProjectSummaryHandler(
      req,
      res
    )) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual(
      "error: missing parameter chainId, roundId, or projectId"
    );
    expect(responseJSON.data).toEqual({});
  });

  it("returns error when invoked without roundId", async () => {
    const req = getMockReq({
      params: {
        chainId: chainId,
        roundId: roundId,
      },
    });

    const responseJSON = (await updateProjectSummaryHandler(
      req,
      res
    )) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual(
      "error: missing parameter chainId, roundId, or projectId"
    );
    expect(responseJSON.data).toEqual({});
  });

  it("returns error when invoked without chainId", async () => {
    const req = getMockReq({
      params: {
        chainId: chainId,
      },
    });

    const responseJSON = (await updateProjectSummaryHandler(
      req,
      res
    )) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual(
      "error: missing parameter chainId, roundId, or projectId"
    );
    expect(responseJSON.data).toEqual({});
  });

  it("returns error when invoked with unsupported votingStrategy", async () => {
    jest.spyOn(console, "error").mockImplementation();
    // mock fetchRoundMetadata call to return data with random votingStrategy name
    const roundMetadata = JSON.parse(JSON.stringify(mockRoundMetadata));
    roundMetadata.votingStrategy.strategyName = faker.name.firstName();

    jest
      .spyOn(utils, "fetchRoundMetadata")
      .mockResolvedValueOnce(roundMetadata);
    const responseJSON = (await updateProjectSummaryHandler(
      req,
      res
    )) as unknown as HandleResponseObject;

    expect(console.error).toHaveBeenCalledWith(
      "updateProjectSummaryHandler",
      "error: unsupported voting strategy"
    );

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: something went wrong");
  });

  it("returns error when exception occurs ", async () => {
    jest.spyOn(console, "error").mockImplementation();

    const responseJSON = (await updateProjectSummaryHandler(
      req,
      res
    )) as unknown as HandleResponseObject;

    expect(console.error).toHaveBeenCalled();

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: something went wrong");
  });

  // TODO: figure out tests with mocked data
  it("returns default response when project has no contributions", async () => {
    const roundMetadata: RoundMetadata = JSON.parse(
      JSON.stringify(mockRoundMetadata)
    );

    jest.spyOn(utils, "fetchRoundMetadata").mockResolvedValue(roundMetadata);
    jest
      .spyOn(linearQuadraticFunding, "fetchQFContributionsForProjects")
      .mockResolvedValueOnce([]);

    const defaultSummary = {
      contributionCount: 0,
      uniqueContributors: 0,
      totalContributionsInUSD: 0,
      averageUSDContribution: 0,
      roundId: roundId,
    };

    const responseJSON = (await updateProjectSummaryHandler(
      req,
      res
    )) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeTruthy();
    expect(responseJSON.message).toEqual(req.originalUrl);
    expect(responseJSON.data).toMatchObject({
      ...defaultSummary,
    });
  });

  it("returns successfull response when project in round has 2 contributions", async () => {
    const roundMetadata: RoundMetadata = JSON.parse(
      JSON.stringify(mockRoundMetadata)
    );
    jest
      .spyOn(utils, "fetchRoundMetadata")
      .mockResolvedValueOnce(roundMetadata);

    const qfContribution: QFContribution = JSON.parse(
      JSON.stringify(mockQFVote)
    );
    const anotherQFVote: QFContribution = JSON.parse(
      JSON.stringify(mockQFVote)
    );

    jest
      .spyOn(linearQuadraticFunding, "fetchQFContributionsForProjects")
      .mockResolvedValueOnce([qfContribution, anotherQFVote]);

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
    jest.spyOn(prismaMock.project, "upsert").mockResolvedValue({
      id: 1,
      chainId: utils.getChainVerbose(chainId),
      roundId,
      projectId,
      ...timestamps,
    });

    jest.spyOn(prismaMock.projectSummary, "upsert").mockResolvedValue({
      ...summary,
      id: 1,
      projectId,
      ...timestamps,
    });

    const responseJSON = (await updateProjectSummaryHandler(
      req,
      res
    )) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeTruthy();
    expect(responseJSON.message).toEqual(req.originalUrl);
    expect(responseJSON.data).toEqual(
      expect.objectContaining({
        ...summary,
      })
    );
  });
});
