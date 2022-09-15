import {
  objectToSortedTuples,
  objectToDeterministicJSON,
  Obj,
  Result,
} from "../../utils/deterministicJSON";

interface Scenarios {
  input: Obj;
  expected: Result;
}

describe("deterministicJSON", () => {
  const scenarios: Scenarios[] = [
    {
      input: "foo",
      expected: "foo",
    },
    {
      input: 2,
      expected: 2,
    },
    {
      input: ["foo", 2],
      expected: ["foo", 2],
    },
    {
      input: { foo: "1", bar: 2 },
      expected: [
        ["foo", "1"],
        ["bar", 2],
      ],
    },
    {
      input: {
        foo: [2, 4, 6],
      },
      expected: [["foo", [2, 4, 6]]],
    },
    {
      input: {
        foo: {
          bar: [2, 4, 6],
        },
      },
      expected: [["foo", [["bar", [2, 4, 6]]]]],
    },
    {
      input: {
        foo: [{ bar: 2 }, { baz: 3 }],
      },
      expected: [["foo", [[["bar", 2]], [["baz", 3]]]]],
    },
    {
      input: {
        foo: [{ bar: 2 }, { baz: 3 }],
        bar: undefined,
      },
      expected: [["foo", [[["bar", 2]], [["baz", 3]]]]],
    },
  ];

  it("converts an object to a list of tuples", async () => {
    scenarios.forEach((scenario) => {
      const result: Result = objectToSortedTuples(scenario.input);
      expect(result).toEqual(scenario.expected);
    });
  });

  it("converts an object to a deterministic JSON", async () => {
    scenarios.forEach((scenario) => {
      const result = objectToDeterministicJSON(scenario.input);
      expect(result).toEqual(JSON.stringify(scenario.expected));
    });
  });
});
