import { parseCollection } from "../collections";
import { ZodError } from "zod";

describe("parseCollection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should parse a valid collection", async () => {
    const data = {
      version: "1.0.0",
      applications: [
        {
          chainId: 1,
          roundId: "0x05df76bc446cee7ad536e2d23c128c9c8909cf7b",
          id: "0",
        },
        {
          chainId: 10,
          roundId: "8",
          id: "7",
        },
      ],
    };

    const response = parseCollection(data);
    expect(response).toEqual(data);
  });

  it("requires a valid version", async () => {
    const data = {
      version: "xyz",
      applications: [],
    };

    const expectedError = new ZodError([
      {
        received: "xyz",
        code: "invalid_enum_value",
        options: ["1.0.0"],
        path: ["version"],
        message: "Invalid enum value. Expected '1.0.0', received 'xyz'",
      },
    ]);

    expect(() => parseCollection(data)).toThrowError(expectedError);
  });

  it("requires applications", async () => {
    const data = {
      version: "1.0.0",
    };

    const expectedError = new ZodError([
      {
        code: "invalid_type",
        expected: "array",
        received: "undefined",
        path: ["applications"],
        message: "Required",
      },
    ]);

    expect(() => parseCollection(data)).toThrowError(expectedError);
  });

  it("requires chainId in applications", async () => {
    const data = {
      version: "1.0.0",
      applications: [
        {
          roundId: "1",
          id: "0",
        },
      ],
    };

    const expectedError = new ZodError([
      {
        code: "invalid_type",
        expected: "number",
        received: "undefined",
        path: ["applications", 0, "chainId"],
        message: "Required",
      },
    ]);

    expect(() => parseCollection(data)).toThrowError(expectedError);
  });

  it("requires roundId in applications", async () => {
    const data = {
      version: "1.0.0",
      applications: [
        {
          chainId: 1,
          id: "0",
        },
      ],
    };

    const expectedError = new ZodError([
      {
        code: "invalid_type",
        expected: "string",
        received: "undefined",
        path: ["applications", 0, "roundId"],
        message: "Required",
      },
    ]);

    expect(() => parseCollection(data)).toThrowError(expectedError);
  });

  it("requires id in applications", async () => {
    const data = {
      version: "1.0.0",
      applications: [
        {
          chainId: 1,
          roundId: "0",
        },
      ],
    };

    const expectedError = new ZodError([
      {
        code: "invalid_type",
        expected: "string",
        received: "undefined",
        path: ["applications", 0, "id"],
        message: "Required",
      },
    ]);

    expect(() => parseCollection(data)).toThrowError(expectedError);
  });
});
