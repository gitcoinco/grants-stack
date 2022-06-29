import { aggregateEvents } from "./projects";

describe("event aggregation", () => {
  it("returns updated at blocks if more recent", () => {
    const createdIds = [
      {
        id: 1,
        block: 7053436,
      },
      {
        id: 2,
        block: 7054374,
      },
      {
        id: 3,
        block: 7054377,
      },
      {
        id: 4,
        block: 7054804,
      },
    ];
    const updateIds = [
      {
        id: 1,
        block: 7053667,
      },
      {
        id: 2,
        block: 7054381,
      },
    ];

    const events = aggregateEvents(createdIds, updateIds);

    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 1, block: 7053667 }),
      ])
    );

    expect(events).toEqual(
      expect.arrayContaining([
        expect.not.objectContaining({
          id: 1,
          block: 7053436,
        }),
      ])
    );
  });
});
