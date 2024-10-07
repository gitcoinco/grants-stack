import { z } from "zod";
import { getAddress } from "viem";
import Papa from "papaparse";
import { Collection } from "../data.types";
import { COLLECTIONS_HARDCODED } from "./collections.data";

export type CollectionsSource =
  | { type: "hardcoded" }
  | { type: "google-sheet"; url: string };

const SPREADSHEET_SCHEMA = z.array(
  z.object({
    id: z.string(),
    author: z.string(),
    name: z.string(),
    description: z.string(),
    images: z.string(),
    applicationRefs: z.string(),
  }),
);

export const getCollections = async (opts?: {
  source: CollectionsSource;
}): Promise<Collection[]> => {
  if (opts?.source.type === "google-sheet") {
    try {
      const res = await fetch(
        opts.source.url,
        // "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-hsia6fcd6bYOKrQCxNHtDX_WcxYTnXMXxVpdCbpzZN8udV0juCjb6cnsx-RraBS9tkJm2sl1mqcP/pub?gid=0&single=true&output=tsv",
      );

      if (!res.ok) {
        throw new Error("Error loading collections");
      }

      const { data: rawData } = Papa.parse(await res.text(), {
        delimiter: "\t",
        header: true,
      });

      const data = SPREADSHEET_SCHEMA.parse(rawData);

      const collections = data.map((collection) => ({
        id: collection.id,
        name: collection.name,
        description: collection.description,
        author: collection.author,
        images: collection.images.split(/\s+/),
        applicationRefs: collection.applicationRefs.split(/\s+/),
      }));

      return collections;
    } catch (err) {
      // Return hardcoded collections in case there is an error accessing online
      // data.  TODO review this choice (should we log the error? should we
      // surface the error? should we return empty collections?)
      return COLLECTIONS_HARDCODED.map(ensureAddressIsInChecksumFormat);
    }
  } else {
    return COLLECTIONS_HARDCODED.map(ensureAddressIsInChecksumFormat);
  }
};

export const getCollectionById = async (
  id: string,
  opts?: { source: CollectionsSource },
): Promise<Collection | null> => {
  const collections = await getCollections(opts);
  return collections.find((c) => c.id === id) ?? null;
};

const ensureAddressIsInChecksumFormat = (
  collection: Collection,
): Collection => ({
  ...collection,
  applicationRefs: collection.applicationRefs.map((applicationRef) => {
    const [chain, address, idx] = applicationRef.split(":");
    return [chain, getAddress(address), idx].join(":");
  }),
});
