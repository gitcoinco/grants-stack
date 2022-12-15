import * as yup from "yup";
import { Request, Response } from "express";
import { ChainName } from "../types";
import {
  getPriceForToken,
  handleResponse,
} from "../utils";

const convertPriceRequestSchema = yup.object().shape({
  contract: yup.string().required(),
  chain: yup.string().required(),
});

/**
 * Converts between crypto and fiat prices
 */
export const convertPriceHandler = async (
  req: Request<any, any, { contract: string; chain: ChainName }>,
  res: Response
) => {
  try {
    await convertPriceRequestSchema.validate(req.body);
  } catch (err: any) {
    return handleResponse(res, 400, err.errors);
  }

  try {
    let result = await getPriceForToken(req.body.contract, req.body.chain);
    return handleResponse(res, 200, "fetched info sucessfully", result);
  } catch (err) {
    // TODO: LOG ERROR TO SENTRY
    // return handleResponse(res, 500, err as string); // FIXME: this won't work because error cannot be serialized
    return handleResponse(res, 500, "error: something went wrong");

    // (its properties arent enumerable)
    // so we either need a custom error message or bear the rist of leaking things when
    // we override the serialization block
  }
};