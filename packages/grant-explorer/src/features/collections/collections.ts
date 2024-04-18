import { z } from "zod";

const collectionSchemaV1 = z.object({
  version: z.enum(["1.0.0"]),
  name: z.string().optional(),
  description: z.string().optional(),
  author: z.string().optional(),
  applications: z.array(
    z.object({
      chainId: z.number(),
      roundId: z.string(),
      id: z.string(),
    })
  ),
});

export type CollectionV1 = z.infer<typeof collectionSchemaV1>;

export function parseCollection(json: unknown) {
  return collectionSchemaV1.parse(json);
}
