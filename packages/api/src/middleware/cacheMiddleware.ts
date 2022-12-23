import {Request, Response, NextFunction} from "express";
import {handleResponse} from "../utils";
import {cache} from "../cacheConfig";

// @ts-ignore
export const cacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const key = `cache_${req.originalUrl}`;
  const forceQuery = req.query.force === "true";
  // Try to get the data from cache
  const data: any = cache.get(key);
  if (data && !forceQuery) {
    // If the data is in cache, send it as the response
    return handleResponse(res, 200, `${req.originalUrl}`, data);
  }
  // If the data is not in cache, call the next middleware function
  next();
};