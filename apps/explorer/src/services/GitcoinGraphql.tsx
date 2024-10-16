import { GraphQLResponse, Project, Round } from "@/domains/types";
import { GraphQLClient, gql } from "graphql-request";

// TODO don't hardcode this lol
const client = new GraphQLClient(
  "https://grants-stack-indexer-v2.gitcoin.co/graphql"
);

export class GitcoinGraphqlService {
  static async getRounds(query: string) {
    // console.log(query)
    // const response = await client.request<GraphQLResponse<{ rounds: Round[] }>>(query)
    const response = await client.request<{ rounds: Round[] }>(query);
    console.log(JSON.stringify(response));
    return response.rounds;
  }

  static async getRound(query: string): Promise<Round> {
    const response = await client.request<{ round: Round }>(query);
    return response.round;
  }

  static async getProjects(query: string): Promise<Project> {
    const response = await client.request<{ projects: Project }>(query);
    return response.projects;
  }
}
