import { Project } from "../types";
import { makeApprovedProjectData } from "../../../test-utils";
import {
  loadFinalBallot,
  loadShortlist,
  saveFinalBallot,
  saveShortlist,
} from "../LocalStorage";

describe("Local Storage", () => {
  describe("shortlist local storage", () => {
    beforeEach(() => {
      localStorage.clear();
      jest.clearAllMocks();
    });

    it("stores shortlist", () => {
      const roundId1 = "1";
      const shortlist: Project[] = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];

      saveShortlist(shortlist, roundId1);

      expect(localStorage.setItem).toHaveBeenLastCalledWith(
        `shortlist-round-${roundId1}`,
        JSON.stringify(shortlist)
      );
      expect(localStorage.__STORE__[`shortlist-round-${roundId1}`]).toBe(
        JSON.stringify(shortlist)
      );
      expect(Object.keys(localStorage.__STORE__).length).toBe(1);
    });

    it("retrieves a shortlist for different rounds", function () {
      const roundId1 = "1";
      const roundId2 = "2";
      const shortlist1: Project[] = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];
      const shortlist2: Project[] = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];
      localStorage.__STORE__[`shortlist-round-${roundId1}`] =
        JSON.stringify(shortlist1);
      localStorage.__STORE__[`shortlist-round-${roundId2}`] =
        JSON.stringify(shortlist2);

      const list1 = loadShortlist(roundId1);
      const list2 = loadShortlist(roundId2);

      expect(list1).toEqual(shortlist1);
      expect(list2).toEqual(shortlist2);
    });

    it("retrieves empty project list when no shortlist exists", function () {
      const list = loadShortlist("1");

      expect(list).toEqual([]);
    });
  });

  describe("finalBallot local storage", () => {
    beforeEach(() => {
      localStorage.clear();
      jest.clearAllMocks();
    });

    it("stores finalBallot", () => {
      const roundId1 = "1";
      const finalBallot: Project[] = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];

      saveFinalBallot(finalBallot, roundId1);

      expect(localStorage.setItem).toHaveBeenLastCalledWith(
        `finalBallot-round-${roundId1}`,
        JSON.stringify(finalBallot)
      );
      expect(localStorage.__STORE__[`finalBallot-round-${roundId1}`]).toBe(
        JSON.stringify(finalBallot)
      );
      expect(Object.keys(localStorage.__STORE__).length).toBe(1);
    });

    it("retrieves a finalBallot for different rounds", function () {
      const roundId1 = "1";
      const roundId2 = "2";
      const finalBallot1: Project[] = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];
      const finalBallot2: Project[] = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];
      localStorage.__STORE__[`finalBallot-round-${roundId1}`] =
        JSON.stringify(finalBallot1);
      localStorage.__STORE__[`finalBallot-round-${roundId2}`] =
        JSON.stringify(finalBallot2);

      const list1 = loadFinalBallot(roundId1);
      const list2 = loadFinalBallot(roundId2);

      expect(list1).toEqual(finalBallot1);
      expect(list2).toEqual(finalBallot2);
    });

    it("retrieves empty project list when no finalBallot exists", function () {
      const list = loadFinalBallot("1");

      expect(list).toEqual([]);
    });
  });
});
