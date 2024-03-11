import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { useDataLayer } from "data-layer";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchProjectApplications } from "../../actions/projects";
import { RootState } from "../../reducers";
import { FormInputs, Metadata, Project } from "../../types";
import About from "./About";
import ProjectDetailsHeader from "./ProjectDetailsHeader";
import Rounds from "./rounds/Rounds";
import Stats from "./stats/Stats";

export default function Details({
  project,
  createdAt,
  updatedAt,
  bannerImg,
  logoImg,
  showApplications,
  showTabs,
}: {
  project?: Metadata | FormInputs | Project;
  updatedAt: number;
  createdAt: number;
  bannerImg: string | Blob;
  logoImg: string | Blob;
  showApplications: boolean;
  showTabs: boolean;
}) {
  const params = useParams();
  const dispatch = useDispatch();
  const dataLayer = useDataLayer();
  const props = useSelector((state: RootState) => {
    const { chainId, id } = params;

    const applications = state.projects.applications?.[params.id!] ?? [];

    return {
      chainId,
      projectID: id!,
      applications,
    };
  });

  useEffect(() => {
    if (params.id!) {
      dispatch(fetchProjectApplications(params.id!, dataLayer));
    }
  }, [params.id!]);

  return (
    <>
      <ProjectDetailsHeader
        title={project?.title ?? ""}
        bannerImg={bannerImg}
        logoImg={logoImg}
      />
      {showTabs ? (
        <Tabs className="mt-8" defaultIndex={0}>
          <TabList className="mb-12" width="fit-content">
            <Tab
              _focus={{ boxShadow: "none" }}
              _selected={{
                color: "#6F3FF5",
                borderBottom: "2px solid",
                borderBottomColor: "#6F3ff5",
              }}
            >
              <span>About</span>
            </Tab>
            <Tab
              _focus={{ boxShadow: "none" }}
              _selected={{
                color: "#6F3FF5",
                borderBottom: "2px solid",
                borderBottomColor: "#6F3ff5",
              }}
            >
              Stats
            </Tab>
            <Tab
              _focus={{ boxShadow: "none" }}
              _selected={{
                color: "#6F3FF5",
                borderBottom: "2px solid",
                borderBottomColor: "#6F3ff5",
              }}
            >
              Rounds
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <About
                project={project}
                applications={props.applications}
                showApplications={showApplications}
                createdAt={createdAt}
                updatedAt={updatedAt}
              />
            </TabPanel>
            <TabPanel>
              <Stats />
            </TabPanel>
            <TabPanel>
              <Rounds applications={props.applications} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      ) : (
        <About
          project={project}
          applications={props.applications}
          showApplications={showApplications}
          createdAt={createdAt}
          updatedAt={updatedAt}
        />
      )}
    </>
  );
}
