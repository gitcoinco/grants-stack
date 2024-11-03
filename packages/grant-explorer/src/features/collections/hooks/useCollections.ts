import useSWR, { SWRResponse } from "swr";
import { CommunityCollection } from "../community";
import { CollectionV1, parseCollection } from "../collections";
import { getConfig } from "common/src/config";

const config = getConfig();

interface RawCollection {
  Timestamp: string;
  "Collection Name": string;
  "Link to collection": string;
  "Description": string;
  "Review State": string;
}

export const useCollections = (): SWRResponse<CommunityCollection[]> => {
  return useSWR(["collections"], async () => {
    const collections = await fetchCommunityCollections();
    console.log("Fetching community collections...", collections);
    return collections;
  });
};

const fetchCommunityCollections = async (): Promise<CommunityCollection[]> => {
  try {
    // Fetch the CSV file from the provided URL
    const response = await fetch(
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vQndqhG0LcZ3omvRgUlp94Bzv_iGkFteXXcsl5wi6lArd2syVczbKXuGRZIn75B8rDQwcHd7ttpHVqG/pub?gid=653038372&single=true&output=csv"
    );
    const csvText = await response.text();

    // Split the CSV text by lines
    const lines = csvText.trim().split("\n");

    // Get the headers from the first line
    const headers = lines[0].split(",");

    // Process the remaining lines as the data rows
    const communityCollections = await Promise.all(
      lines.slice(1).map(async (line) => {
        // Split each line by commas
        const values = line.split(",");

        // Create a collection object by mapping headers to values
        const collection: Partial<RawCollection> = headers.reduce(
          (obj, header, index) => {
            obj[header.trim() as keyof RawCollection] = values[index].trim();
            return obj;
          },
          {} as Partial<RawCollection>
        ); // Use Partial to allow missing fields

        const {
          "Collection Name": name,
          "Link to collection": link,
          "Description":
            description,
          "Review State": reviewState,
        } = collection;

        // Filter out collections where Review State is not "Approved"
        if (reviewState !== "Accepted") {
          return null; // Return null for unapproved collections
        }

        // Extract the CID from the link (assuming it's the last part of the URL)
        const cid = link?.split("/").pop();

        // Return the structured object with a fixed project count
        return {
          cid,
          name,
          description,
          numberOfProjects: 0, // note: keeping this as 0 as this querying from IPFS slows down
        };
      })
    );

    // Filter out null values from the results
    return communityCollections.filter((collection) => collection !== null);
  } catch (error) {
    console.error("Error fetching community collections:", error);
    throw error;
  }
};

export const useIpfsCollection = (
  cid: string | undefined
): SWRResponse<CollectionV1> => {
  return useSWR(
    cid === undefined ? null : ["collections/ipfs", cid],
    async () => {
      const url = `${config.ipfs.baseUrl}/ipfs/${cid}`;
      return fetch(url)
        .then((res) => res.json())
        .then(parseCollection);
    }
  );
};
