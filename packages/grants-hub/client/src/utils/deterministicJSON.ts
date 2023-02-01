export type Key = string | number;
export type Obj = Key | { [key: string]: Obj } | Obj[] | undefined;

export type Tuple = [Key, Key | Key[] | Tuple];
export type Result = Key | Tuple | Result[] | undefined;

export const objectToSortedTuples = (obj: Obj): Result => {
  if (typeof obj === "string" || typeof obj === "number" || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((i) => objectToSortedTuples(i));
  }

  const keys = Object.keys(obj);
  const initialResult: Result = [];

  return keys.reduce((res, key) => {
    const value = obj[key];

    if (value === undefined) {
      return res;
    }

    const sorted = objectToSortedTuples(value);
    res.push([key, sorted] as Result);
    return res;
  }, initialResult);
};

export const objectToDeterministicJSON = (obj: Obj): string => {
  const tuples = objectToSortedTuples(obj);
  return JSON.stringify(tuples);
};
