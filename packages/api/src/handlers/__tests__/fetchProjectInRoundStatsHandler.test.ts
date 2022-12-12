import { Request, Response } from "express";
import { faker } from '@faker-js/faker';
import { fetchProjectInRoundStatsHandler } from "../fetchProjectInRoundStatsHandler";
import { HandleResponseObject } from "../../types";
import { mockQFContribution, mockRoundMetadata, mockRoundStats } from "../../test-utils";
import * as utils from "../../utils";
import * as linearQuadraticFunding from "../../votingStrategies/linearQuadraticFunding";

describe("fetchProjectInRoundStatsHandler", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  const roundId = faker.finance.ethereumAddress.toString();
  const projectId = faker.finance.ethereumAddress.toString();
  const chainId = "3";

  const req = {
    query: {
      roundId: roundId,
      projectId: projectId,
      chainId: chainId,
    },
  } as unknown as Request;

  const res = {
    send: jest.fn(),
    json: (object: any) => {
      return object
    }
  } as unknown as Response;

  it("returns error when invoked without roundId", async () => {

    const req = {
      query: {
        projectId: projectId,
        chainId: chainId,
      },
    } as unknown as Request;

    const responseJSON = await fetchProjectInRoundStatsHandler(req, res) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: missing parameter roundId");
    expect(responseJSON.data).toEqual({});
  });

  it("returns error when invoked without chainId", async () => {
    const req = {
      query: {
        roundId: roundId,
        projectId: projectId,
      },
    } as unknown as Request;

    const responseJSON = await fetchProjectInRoundStatsHandler(req, res) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: missing parameter chainId");
    expect(responseJSON.data).toEqual({});
  });


  it("returns error when invoked without projectId", async () => {
    const req = {
      query: {
        roundId: roundId,
        chainId: chainId,
      },
    } as unknown as Request;

    const responseJSON = await fetchProjectInRoundStatsHandler(req, res) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: missing parameter projectId");
    expect(responseJSON.data).toEqual({});
  });

  it("returns error when no matching voting strategy is found", async () => {

    // mock fetchRoundMetadata call to return data with random votingStrategy name
    const roundMetadata = JSON.parse(JSON.stringify(mockRoundMetadata));;
    roundMetadata.votingStrategy.strategyName = faker.name.firstName();

    jest.spyOn(utils, 'fetchRoundMetadata').mockResolvedValueOnce(roundMetadata);

    const responseJSON = await fetchProjectInRoundStatsHandler(req, res) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: unsupported voting strategy");
    expect(responseJSON.data).toEqual({});

  });

  it("returns error stats when exception happens while invoking linearQFFetchVotesForProjectInRound", async () => {
    const responseJSON = await fetchProjectInRoundStatsHandler(req, res) as unknown as HandleResponseObject;
    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: something went wrong.");
    expect(responseJSON.data).toEqual({});
  });

  it("returns round stats when invoked with valid parameters", async () => {
    // mock round metadata
    const roundMetadata = JSON.parse(JSON.stringify(mockRoundMetadata));;
    jest.spyOn(utils, 'fetchRoundMetadata').mockResolvedValueOnce(roundMetadata);
    
    // mock votes
    const votes = [mockQFContribution, mockQFContribution];
    jest.spyOn(linearQuadraticFunding, 'fetchVotesForProjectInRoundHandler').mockResolvedValueOnce(votes);

    // mock votes
    const roundStats = mockRoundStats;
    jest.spyOn(linearQuadraticFunding, 'fetchStatsHandler').mockResolvedValueOnce(mockRoundStats);

    const responseJSON = await fetchProjectInRoundStatsHandler(req, res) as unknown as HandleResponseObject;
        
    expect(linearQuadraticFunding.fetchVotesForProjectInRoundHandler).toBeCalled();
    expect(linearQuadraticFunding.fetchStatsHandler).toBeCalled();
    expect(responseJSON.success).toEqual(true);
    expect(responseJSON.message).toEqual("fetched project in round stats successfully");
    expect(responseJSON.data).toEqual(roundStats);
  });
});
