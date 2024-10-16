import { gql } from "graphql-request";
import { useQuery } from "@tanstack/react-query";
import { minutesToMilliseconds } from "date-fns";

import { GitcoinGraphqlService } from "@/kit/services/GitcoinGraphql";
import { Project } from "@/kit/domains/types";

export const getProjectKey = (query?: string) => {
  return ["project", query];
};

const defaultQuery: string = gql`
  query activeProjects {
    projects(first: 10) {
      metadata
      name
    }
  }
`;

export const useProjects = (query: string = defaultQuery) => {
  const result = useQuery({
    queryKey: getProjectKey(query),
    queryFn: async () => GitcoinGraphqlService.getProjects(query),
    staleTime: minutesToMilliseconds(120),
  });

  console.log(JSON.stringify(result));
  return result;
};

export const useProject = (projectId: string, chainId: number) => {
  const query = gql`
  query singleProject {
    project(chainId: ${chainId}, id: "${projectId}") {
      id
      metadata
    }
  }
`;
  const result = useQuery({
    queryKey: getProjectKey(query),
    queryFn: async () => GitcoinGraphqlService.getProject(query),
    staleTime: minutesToMilliseconds(120),
  });

  console.log("useprojects", JSON.stringify(result));
  return result;
};
