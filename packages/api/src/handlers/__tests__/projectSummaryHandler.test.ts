import {Response} from "express";
import {faker} from '@faker-js/faker';
import {HandleResponseObject, QFContributionSummary, QFContribution, RoundMetadata} from "../../types";
import * as utils from "../../utils";
import * as linearQuadraticFunding from "../../votingStrategies/linearQuadraticFunding";

import {updateProjectSummaryHandler} from "../updateProjectSummaryHandler";
import {mockRoundMetadata, mockQFContributionSummary, mockQFVote} from "../../test-utils";

import {getMockReq} from '@jest-mock/express'

const SECONDS = 1000;
jest.setTimeout(70 * SECONDS)

describe("projectSummaryHandler", () => {
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
    }, params: {
      chainId: chainId,
      roundId: roundId,
      projectId: projectId
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

    const responseJSON = await updateProjectSummaryHandler(req, res) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: missing parameter chainId, roundId, or projectId");
    expect(responseJSON.data).toEqual({});
  });

  it("returns error when invoked without roundId", async () => {
    const req = getMockReq({
      params: {
        roundId: roundId
      }
    })

    const responseJSON = await updateProjectSummaryHandler(req, res) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: missing parameter chainId, roundId, or projectId");
    expect(responseJSON.data).toEqual({});
  });


  it("returns error when invoked without roundId", async () => {
    const req = getMockReq({
      params: {
        chainId: chainId,
        roundId: roundId
      }
    })

    const responseJSON = await updateProjectSummaryHandler(req, res) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: missing parameter chainId, roundId, or projectId");
    expect(responseJSON.data).toEqual({});
  });

  it("returns error when invoked without chainId", async () => {
    const req = getMockReq({
      params: {
        chainId: chainId,
      }
    });

    const responseJSON = await updateProjectSummaryHandler(req, res) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: missing parameter chainId, roundId, or projectId");
    expect(responseJSON.data).toEqual({});
  });


  it("returns error when invoked with unsupported votingStrategy", async () => {

    // mock fetchRoundMetadata call to return data with random votingStrategy name
    const roundMetadata = JSON.parse(JSON.stringify(mockRoundMetadata));
    roundMetadata.votingStrategy.strategyName = faker.name.firstName();

    jest.spyOn(utils, 'fetchRoundMetadata').mockResolvedValueOnce(roundMetadata);
    const responseJSON = await updateProjectSummaryHandler(req, res) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: something went wrong");
    expect(responseJSON.data).toEqual("error: unsupported voting strategy");
  });


  it("returns error when exception occurs ", async () => {

    const responseJSON = await updateProjectSummaryHandler(req, res) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: something went wrong");
  });

  // TODO: figure out tests with mocked data
  // it("returns default response when project has no contributions", async () => {
  //
  //   const roundMetadata: RoundMetadata = JSON.parse(JSON.stringify(mockRoundMetadata));
  //   jest.spyOn(utils, 'fetchRoundMetadata').mockResolvedValueOnce(roundMetadata);
  //
  //   jest.spyOn(linearQuadraticFunding, 'fetchQFContributionsForProjects').mockResolvedValueOnce([]);
  //
  //   const defaultSummary: QFContributionSummary = {
  //     contributionCount: 0,
  //     uniqueContributors: 0,
  //     totalContributionsInUSD: "0",
  //     averageUSDContribution: "0",
  //   };
  //
  //   const responseJSON = await updateProjectSummaryHandler(req, res) as unknown as HandleResponseObject;
  //
  //   expect(responseJSON.success).toBeTruthy();
  //   expect(responseJSON.message).toEqual("fetched project summary successfully");
  //   expect(responseJSON.data).toEqual(defaultSummary);
  //
  // });
  //
  // it("returns successfull response when project in round has 2 contributions", async () => {
  //
  //   const roundMetadata: RoundMetadata = JSON.parse(JSON.stringify(mockRoundMetadata));
  //   jest.spyOn(utils, 'fetchRoundMetadata').mockResolvedValueOnce(roundMetadata);
  //
  //   const qfContribution: QFContribution = JSON.parse(JSON.stringify(mockQFVote));
  //   const anotherQFVote: QFContribution = JSON.parse(JSON.stringify(mockQFVote));
  //
  //   jest.spyOn(linearQuadraticFunding, 'fetchQFContributionsForProjects').mockResolvedValueOnce([qfContribution, anotherQFVote]);
  //
  //   const summary: QFContributionSummary = JSON.parse(JSON.stringify(mockQFContributionSummary));
  //   jest.spyOn(linearQuadraticFunding, 'summarizeQFContributions').mockResolvedValueOnce(summary);
  //
  //   const responseJSON = await updateProjectSummaryHandler(req, res) as unknown as HandleResponseObject;
  //
  //   expect(responseJSON.success).toBeTruthy();
  //   expect(responseJSON.message).toEqual("fetched project summary successfully");
  //   expect(responseJSON.data).toEqual(summary);
  // });
});
