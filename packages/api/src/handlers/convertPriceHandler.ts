import { Request, Response } from "express";
import { ChainName } from "../types";
import {
  getPriceForToken,
  handleResponse,
} from "../utils";

/**
 * Converts between crypto and fiat prices
 */
export const convertPriceHandler = async (req: Request, res: Response) => {

  const { chainName, tokenContract } = req.params;

  if (!chainName || !tokenContract) {
    return handleResponse(res, 400, "error: missing parameter chainName or tokenContract");
  }

  try {
    let result = await getPriceForToken(tokenContract, chainName as ChainName);
    return handleResponse(res, 200, "fetched conversion rate sucessfully", result);
  } catch (err) {
    // TODO: LOG ERROR TO SENTRY
    // return handleResponse(res, 500, err as string); // FIXME: this won't work because error cannot be serialized
    return handleResponse(res, 500, "error: something went wrong");
  }
};