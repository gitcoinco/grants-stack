import NodeCache from "node-cache";
import {Request, Response, NextFunction} from "express";
import {handleResponse} from "../utils";

export const cache = new NodeCache({stdTTL: 60 * 10, checkperiod: 60 * 10});

// @ts-ignore
export const cacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const key = `cache_${req.originalUrl}`;
  const forceQuery = req.query.force === "true";
  // Try to get the data from cache
  const data = cache.get(key);
  if (data && !forceQuery) {
    // If the data is in cache, send it as the response
    console.log('cache hit');
    return handleResponse(res, 200, `${req.originalUrl}`, data);
  }
  // If the data is not in cache, call the next middleware function
  next();
};