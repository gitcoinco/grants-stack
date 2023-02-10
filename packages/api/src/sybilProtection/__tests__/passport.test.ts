import { enableFetchMocks, FetchMock } from "jest-fetch-mock";
enableFetchMocks();
const fetchMock = fetch as FetchMock;

import {
  mockPassportAboveThreshold,
  mockPassportBelowThreshold,
} from "../../test-utils";

import {
  fetchContributorsAboveThreshold,
  fetchPassportScores,
  filterPassportByEvidence,
} from "../passport";

import * as passport from "../passport";

describe("passport", () => {
  describe("fetchPassportScores", () => {
    beforeEach(() => {
      fetchMock.resetMocks();
    });

    it("SHOULD call fetch WHEN invoked with query parameters", async () => {
      const passports = [
        mockPassportAboveThreshold(),
        mockPassportBelowThreshold(),
      ];

      fetchMock.mockResponseOnce(
        JSON.stringify({
          count: passports.length,
          items: passports,
        })
      );

      const communityId = 13;
      const offset = 100;
      const limit = 100;

      await fetchPassportScores(communityId, limit, offset);

      expect(fetchMock).toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledWith(
        `https://api.scorer.gitcoin.co/registry/score/${communityId}?limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PASSPORT_API_KEY}`,
            "Content-Type": "application/json",
          },
          method: "GET",
        }
      );
    });
  });

  describe("filterPassportByEvidence", () => {
    beforeEach(() => {
      fetchMock.resetMocks();
    });

    it("SHOULD return empty array WHEN all passport are below threshold", () => {
      const passports = [
        mockPassportBelowThreshold(),
        mockPassportBelowThreshold(),
      ];

      const passportsAboveThreshold = filterPassportByEvidence(passports);

      expect(passportsAboveThreshold.length).toEqual(0);
    });

    it("SHOULD filter passport scores above threshold", () => {
      const passports = [
        mockPassportAboveThreshold(),
        mockPassportBelowThreshold(),
      ];

      const passportsAboveThreshold = filterPassportByEvidence(passports);

      expect(passportsAboveThreshold.length).toEqual(1);
      expect(passportsAboveThreshold[0]).toEqual(passports[0]);
    });
  });

  describe("fetchContributorsAboveThreshold", () => {
    jest.mock("../passport");

    const count = 1000;

    beforeEach(() => {
      fetchMock.resetMocks();
      jest.clearAllMocks();
    });

    it("SHOULD return empty array WHEN all passports are below threshold", async () => {
      const passports = [
        mockPassportBelowThreshold(),
        mockPassportBelowThreshold(),
        mockPassportBelowThreshold(),
      ];

      fetchMock.mockResponseOnce(
        JSON.stringify({
          items: passports,
          count: count,
        })
      );

      jest.spyOn(passport, "fetchPassportScores").mockResolvedValueOnce({
        passports,
        count,
      });

      const contributors = await fetchContributorsAboveThreshold();
      expect(contributors.length).toEqual(0);
    });

    it("SHOULD return array of addresses WHOSE passports are above threshold", async () => {
      const passports = [
        mockPassportAboveThreshold(),
        mockPassportAboveThreshold(),
        mockPassportBelowThreshold(),
      ];

      fetchMock.mockResponseOnce(
        JSON.stringify({
          items: passports,
          count: count,
        })
      );

      jest.spyOn(passport, "fetchPassportScores").mockResolvedValueOnce({
        passports,
        count,
      });

      const contributors = await fetchContributorsAboveThreshold();

      expect(contributors.length).toEqual(2);
      expect(contributors[0].toLowerCase()).toEqual(
        passports[0].address?.toLowerCase()
      );
      expect(contributors[1].toLocaleLowerCase()).toEqual(
        passports[1].address?.toLowerCase()
      );
    });

    it("SHOULD invoke fetchPassportScores N times WHEN pagination count is N", async () => {
      const paginationCount = 3;

      const passports = [
        mockPassportAboveThreshold(),
        mockPassportAboveThreshold(),
        mockPassportBelowThreshold(),
      ];

      fetchMock.mockResponseOnce(
        JSON.stringify({
          items: passports,
          count: count,
        })
      );

      jest.spyOn(passport, "fetchPassportScores").mockResolvedValue({
        passports,
        count: count * paginationCount,
      });

      await fetchContributorsAboveThreshold();

      expect(fetchPassportScores).toBeCalledTimes(paginationCount);
    });
  });
});
