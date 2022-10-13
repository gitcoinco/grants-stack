import { Project } from "../types";
import { makeApprovedProjectData } from "../../../test-utils";
import { loadShortlist, saveShortlist } from "../LocalStorage";

describe("Local Storage", () => {
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
