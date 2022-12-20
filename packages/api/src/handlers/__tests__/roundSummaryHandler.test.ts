import {Response} from "express";
import {faker} from '@faker-js/faker';
import {HandleResponseObject, QFContributionSummary} from "../../types";
import * as utils from "../../utils";
import * as linearQuadraticFunding from "../../votingStrategies/linearQuadraticFunding";

import {roundSummaryHandler} from "../../handlers/roundSummaryHandler";
import {mockRoundMetadata, mockQFContributionSummary, mockQFVote} from "../../test-utils";

import {getMockReq} from '@jest-mock/express'

const SECONDS = 1000;
jest.setTimeout(70 * SECONDS)


describe("roundSummaryHandler", () => {
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
    }
  });
  const res = {
    send: jest.fn(),
    json: (object: any) => {
      return object
    }
  } as unknown as Response;


  it("returns error when invoked no params", async () => {
    const req = getMockReq({params: {}})

    const responseJSON = await roundSummaryHandler(req, res) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: missing parameter chainId or roundId");
    expect(responseJSON.data).toEqual({});
  });

  it("returns error when invoked without roundId", async () => {
    const req = getMockReq({
      params: {
        roundId: roundId
      }
    })

    const responseJSON = await roundSummaryHandler(req, res) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: missing parameter chainId or roundId");
    expect(responseJSON.data).toEqual({});
  });

  it("returns error when invoked without chainId", async () => {
    const req = getMockReq({
      params: {
        chainId: chainId,
      }
    });

    const responseJSON = await roundSummaryHandler(req, res) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: missing parameter chainId or roundId");
    expect(responseJSON.data).toEqual({});
  });


  it("returns error when invoked with unsupported votingStrategy", async () => {

    // mock fetchRoundMetadata call to return data with random votingStrategy name
    const roundMetadata = JSON.parse(JSON.stringify(mockRoundMetadata));
    roundMetadata.votingStrategy.strategyName = faker.name.firstName();

    jest.spyOn(utils, 'fetchRoundMetadata').mockResolvedValueOnce(roundMetadata);
    const responseJSON = await roundSummaryHandler(req, res) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: something went wrong");
    expect(responseJSON.data).toEqual("error: unsupported voting strategy");
  });


  it("returns error when exception occurs ", async () => {

    const responseJSON = await roundSummaryHandler(req, res) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: something went wrong");
  });

  // TODO: figure out how to mock the fetchRoundMetadata call with database

  // it("returns default response when round has no contributions", async () => {
  //
  //   const roundMetadata = JSON.parse(JSON.stringify(mockRoundMetadata));
  //   jest.spyOn(utils, 'fetchRoundMetadata').mockResolvedValueOnce(roundMetadata);
  //
  //   jest.spyOn(linearQuadraticFunding, 'fetchQFContributionsForRound').mockResolvedValueOnce([]);
  //
  //   const defaultSummary = {
  //     contributionCount: 0,
  //     uniqueContributors: 0,
  //     totalContributionsInUSD: 0,
  //     averageUSDContribution: 0,
  //   };
  //
  //   const responseJSON = await roundSummaryHandler(req, res) as unknown as HandleResponseObject;
  //
  //
  //   expect(responseJSON.success).toBeTruthy();
  //   // expect(responseJSON.message).toEqual("fetched round summary successfully");
  //   // expect(responseJSON.data).toEqual(defaultSummary);
  //
  // });
  //
  // it("returns successful response when round has 2 contributions", async () => {
  //
  //   jest.setTimeout(100000);
  //
  //
  //   const roundMetadata = JSON.parse(JSON.stringify(mockRoundMetadata));
  //   jest.spyOn(utils, 'fetchRoundMetadata').mockResolvedValueOnce(roundMetadata);
  //
  //   const qfVote = JSON.parse(JSON.stringify(mockQFVote));
  //   jest.spyOn(linearQuadraticFunding, 'fetchQFContributionsForRound').mockResolvedValueOnce([qfVote]);
  //
  //   const summary = JSON.parse(JSON.stringify(mockQFContributionSummary));
  //   jest.spyOn(linearQuadraticFunding, 'summarizeQFContributions').mockResolvedValueOnce(summary);
  //
  //   const responseJSON = await roundSummaryHandler(req, res) as unknown as HandleResponseObject;
  //
  //   expect(responseJSON.success).toBeTruthy();
  //   expect(responseJSON.message).toEqual("fetched round summary successfully");
  //   expect(responseJSON.data).toEqual(summary);
  // });
});
