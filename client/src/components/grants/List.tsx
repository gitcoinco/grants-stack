import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { RootState } from "../../reducers";
import { newGrantPath } from "../../routes";
import { loadProjects } from "../../actions/projects";
import Globe from "../icons/Globe";
import Button, { ButtonVariants } from "../base/Button";
import Card from "./Card";
import colors from "../../styles/colors";
import { ProjectEvent } from "../../types";
import { Status } from "../../reducers/projects";

function ProjectsList() {
  const dispatch = useDispatch();
  const props = useSelector(
    (state: RootState) => ({
      loading: state.projects.status === Status.Loading,
      projects: state.projects.projects,
      chainID: state.web3.chainID,
    }),
    shallowEqual
  );

  useEffect(() => {
    dispatch(loadProjects());
  }, [dispatch]);

  return (
    <div className="flex flex-col flex-grow h-full mx-4 sm:mx-0">
      {props.loading && <>loading...</>}

      {!props.loading && (
        <>
          <div className="flex flex-col mt-4 mb-4">
            <h3>My Projects</h3>
            <p className="text-base">
              Manage projects across multiple grants programs.
            </p>
          </div>
          <div className="grow">
            {props.projects.length ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {props.projects.map((event: ProjectEvent) => (
                  <Card projectId={event.id} key={event.id} />
                ))}
              </div>
            ) : (
              <div className="flex h-full justify-center items-center">
                <div className="flex flex-col items-center">
                  <div className="w-10">
                    <Globe color={colors["primary-background"]} />
                  </div>
                  <h4 className="mt-6">No projects</h4>
                  <p className="text-xs mt-6">
                    It looks like you haven&apos;t created any projects yet.
                  </p>
                  <p className="text-xs">Learn More</p>
                  <Link to={newGrantPath()} className="mt-6">
                    <Button variant={ButtonVariants.outline}>
                      Create a Project
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ProjectsList;
