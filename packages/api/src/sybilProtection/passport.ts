import { ethers } from "ethers";
import  { PassportResponse } from "../types";
import fetch from "node-fetch";

type PassportScoresResponse = {
  count: number,
  passports: PassportResponse[]
}

/**
 * Fetches list of contributors who have score above the threshold
 * as reported by the ThresholdScoreCheck from passport scorer
 *
 * @returns string[]
 */
export const fetchContributorsAboveThreshold = async () => {

  const communityId = 13;
  const limit = 1000;
  let offset = 0;

  let allPassports: PassportResponse[];

  let { passports, count } = await fetchPassportScores(
    communityId, limit, offset
  );

  allPassports = passports;

  const paginationCount = count / limit;

  for (let i = 1; i < paginationCount; i++) {
    // increase offset
    offset += limit;

    // fetch next set of passports
    const { passports } = await fetchPassportScores(
      communityId, limit, offset
    );

    allPassports.push(...passports);
  }

  const passportAboveThreshold = filterPassportByEvidence(allPassports);

  let contributorsAboveThreshold: string[] = [];
  passportAboveThreshold.map(passport => {
    const checksumAddress = ethers.utils.getAddress(passport.address!);
    contributorsAboveThreshold.push(checksumAddress);
  });

  return contributorsAboveThreshold;
}

/**
 * Filters passports having evidence.success as true
 *
 * @param passports PassportResponse[]
 * @returns PassportResponse[]
 */
export const filterPassportByEvidence = (passports: PassportResponse[]): PassportResponse[] => {
  return passports.filter(passport => passport.evidence && passport.evidence.success)
}

/**
 * Fetches passport scores of a given community based on limit and offset
 *
 * @param communityId number
 * @param limit number
 * @param offset number
 * @returns Promise<PassportScoresResponse>
 */
export const fetchPassportScores = async (
  communityId: number,
  limit: number,
  offset: number
): Promise<PassportScoresResponse> => {

  const passportURL = `https://api.scorer.gitcoin.co/registry/score/${communityId}?limit=${limit}&offset=${offset}`;

  const response = await fetch(passportURL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PASSPORT_API_KEY}`,
    }
  });

  const jsonResponse = await response.json();

  const count: number = jsonResponse.count;
  let passports: PassportResponse[] = jsonResponse.items;

  return {
    passports,
    count
  }
}