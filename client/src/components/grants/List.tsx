import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { RootState } from "../../reducers";
import { newGrantPath } from "../../routes";
import { loadProjects, unloadProjects } from "../../actions/projects";
import Globe from "../icons/Globe";
import Button, { ButtonVariants } from "../base/Button";
import Card from "./Card";

function ProjectsList() {
  const dispatch = useDispatch();
  const props = useSelector(
    (state: RootState) => ({
      loading: state.projects.loading,
      grants: state.projects.projects,
      chainID: state.web3.chainID,
    }),
    shallowEqual
  );

  useEffect(() => {
    dispatch(loadProjects());
    return () => {
      dispatch(unloadProjects());
    };
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
            {props.grants.length ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {props.grants.map((item: number) => (
                  <Card projectId={item} key={item} />
                ))}
              </div>
            ) : (
              <div className="flex h-full justify-center items-center">
                <div className="flex flex-col items-center">
                  <Globe />
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
