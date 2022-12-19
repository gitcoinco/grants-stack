import { faker } from "@faker-js/faker";
import { getMockReq } from "@jest-mock/express";
import { HandleResponseObject } from "../../types";
import { convertPriceHandler } from "../../handlers/convertPriceHandler";
import * as utils from "../../utils";


describe("convertPriceHandler", () => {

  const chainName = "ethereum";
  const tokenContract = faker.finance.ethereumAddress.toString();

  const req = getMockReq({ params: {
    chainName: chainName,
    tokenContract: tokenContract
  }});

  const res = {
    send: jest.fn(),
    json: (object: any) => {
      return object
    }
  } as unknown as any;


  it("returns error when invoked without params set", async () => {
    const req = getMockReq({ params: {} });

    const responseJSON = await convertPriceHandler(req, res) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: missing parameter chainName or tokenContract");
    expect(responseJSON.data).toEqual({});
  });

  it("returns error when invoked without chainName", async () => {
    const req = getMockReq({ params: {
      chainName: chainName
    }});

    const responseJSON = await convertPriceHandler(req, res) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: missing parameter chainName or tokenContract");
    expect(responseJSON.data).toEqual({});
  });

  it("returns error when invoked without tokenContract", async () => {
    const req = getMockReq({ params: {
      tokenContract: tokenContract
    } })

    const responseJSON = await convertPriceHandler(req, res) as unknown as HandleResponseObject;

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: missing parameter chainName or tokenContract");
    expect(responseJSON.data).toEqual({});
  });

  it("returns error when an exception occurs ", async () => {

    const responseJSON = await convertPriceHandler(req, res) as unknown as HandleResponseObject;

    jest.spyOn(utils, 'getPriceForToken').mockResolvedValueOnce(new Error(":("));

    expect(responseJSON.success).toBeFalsy();
    expect(responseJSON.message).toEqual("error: something went wrong");
    expect(responseJSON.data).toEqual({});
  });

  it("returns error when an exception occurs ", async () => {

    const responseJSON = await convertPriceHandler(req, res) as unknown as HandleResponseObject;

    jest.spyOn(utils, 'getPriceForToken').mockResolvedValueOnce("1.2");

    expect(responseJSON.success).toBeTruthy();
    expect(responseJSON.message).toEqual("fetched conversion rate sucessfully");
  });

});