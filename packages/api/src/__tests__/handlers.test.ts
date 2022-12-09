import { Request, Response } from "express";
import { fetchRoundStatusHandler } from "../handlers";

describe("fetchRoundStatusHandler", () => {
  it("fetches round status successfully", async () => {
    const mockRequest = {
      query: {
        roundId: "123",
        projectId: "456",
        chainId: "3",
      },
    };
    const mockResponse = {
      send: jest.fn(),
      json: (c: any) => {
        console.log(c);
      },
    };

    await fetchRoundStatusHandler(
      mockRequest as unknown as Request,
      mockResponse as unknown as Response
    );
  });
});
