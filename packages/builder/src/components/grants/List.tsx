import { useDataLayer } from "data-layer";
import { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useAlloVersion } from "common/src/components/AlloVersionSwitcher";
import { loadAllChainsProjects } from "../../actions/projects";
import { checkRoundApplications } from "../../actions/roundApplication";
import { loadRound } from "../../actions/rounds";
import { RoundApply } from "../../assets";
import useLocalStorage from "../../hooks/useLocalStorage";
import { RootState } from "../../reducers";
import { Status } from "../../reducers/projects";
import { ApplicationModalStatus } from "../../reducers/roundApplication";
import { newGrantPath, roundPath } from "../../routes";
import colors from "../../styles/colors";
import { parseRoundToApply } from "../../utils/utils";
import Button, { ButtonVariants } from "../base/Button";
import CallbackModal from "../base/CallbackModal";
import ErrorModal from "../base/ErrorModal";
import LoadingSpinner from "../base/LoadingSpinner";
import RoundApplyAlert from "../base/RoundApplyAlert";
import Globe from "../icons/Globe";
import Card from "./Card";
import { unloadAll } from "../../actions/grantsMetadata";

function ProjectsList() {
  const dataLayer = useDataLayer();
  const dispatch = useDispatch();
  const [showErrorModal, setShowErrorModal] = useState<boolean>(true);
  const { version: alloVersion } = useAlloVersion();

  const [toggleModal, setToggleModal] = useLocalStorage(
    "toggleRoundApplicationModal",
    ApplicationModalStatus.Undefined
  );

  const [roundToApply] = useLocalStorage("roundToApply", null);

  const props = useSelector((state: RootState) => {
    // undefined while the round application is loading, boolean once it's loaded
    let existingApplication;

    let alreadyApplied: undefined | boolean;
    let round;

    if (roundToApply) {
      const roundAddress = roundToApply.split(":")[1];
      existingApplication = state.roundApplication[roundAddress];
      if (existingApplication !== undefined) {
        alreadyApplied = existingApplication.projectsIDs.length > 0;
      }
      const roundState = state.rounds[roundAddress];
      round = roundState ? roundState.round : undefined;
    }
    const projectIds = Object.keys(state.grantsMetadata);

    const showRoundModal =
      roundToApply &&
      projectIds.length > 0 &&
      toggleModal <= ApplicationModalStatus.NotApplied &&
      alreadyApplied === false;

    const applicationStartTime = round?.applicationsStartTime ?? 0;
    const applicationEndTime = round?.applicationsEndTime ?? 0;
    const showRoundAlert =
      alreadyApplied === false &&
      applicationStartTime + 1000 < new Date().getTime() / 1000 &&
      applicationEndTime - 1000 > new Date().getTime() / 1000;

    return {
      status: state.projects.status,
      loading: state.projects.status === Status.Loading,
      error: state.projects.status === Status.Error,
      projectIDs: projectIds,
      chainID: state.web3.chainID,
      existingApplication,
      showRoundModal,
      showRoundAlert,
      round,
    };
  }, shallowEqual);

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(unloadAll());
    dispatch(loadAllChainsProjects(dataLayer, true));
  }, []);

  useEffect(() => {
    if (roundToApply) {
      const [chainId, roundId] = roundToApply.split(":");
      dispatch(loadRound(roundId, dataLayer, Number(chainId)));
    }
  }, [roundToApply]);

  useEffect(() => {
    if (roundToApply && props.projectIDs.length > 0) {
      const { chainID, roundAddress } = parseRoundToApply(roundToApply);

      // not loaded yet
      if (
        props.existingApplication === undefined &&
        chainID !== undefined &&
        roundAddress !== undefined
      ) {
        dispatch(
          checkRoundApplications(
            Number(chainID),
            roundAddress,
            props.projectIDs,
            dataLayer
          )
        );
      }
    }
  }, [props.projectIDs, props.existingApplication]);

  if (props.loading && !props.error) {
    return (
      <LoadingSpinner
        label="Loading Projects"
        size="24"
        thickness="6px"
        showText
      />
    );
  }

  return (
    <div className="flex flex-col flex-grow h-full mx-4 sm:mx-0">
      <div className="flex flex-col mt-4 mb-4">
        <h3>My Projects</h3>
        <p className="text-base">Bring your project to life.</p>
      </div>
      {props.error && showErrorModal ? (
        <ErrorModal
          open
          secondaryBtnText="Close"
          primaryBtnText="Refresh Page"
          onRetry={() => setShowErrorModal(false)}
          onClose={() => navigate(0)}
        >
          <>
            There has been an error loading your projects. Please try refreshing
            the page. If the issue persists, reach out to our{" "}
            <a
              target="_blank"
              className="text-gitcoin-violet-400 outline-none"
              href="https://support.gitcoin.co/gitcoin-knowledge-base/misc/contact-us"
              rel="noreferrer"
            >
              Support team.
            </a>
          </>
        </ErrorModal>
      ) : (
        <>
          {props.round?.tags.includes(alloVersion) && (
            <RoundApplyAlert
              show={props.showRoundAlert}
              confirmHandler={() => {
                const { chainID, roundAddress } =
                  parseRoundToApply(roundToApply);
                const path = roundPath(chainID!, roundAddress!);

                navigate(path);
              }}
              round={props.round}
            />
          )}
          <div className="grow">
            {props.projectIDs.length ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {props.projectIDs.map((id: string) => (
                  <Card projectId={id} key={id} />
                ))}
              </div>
            ) : (
              <div className="flex h-full justify-center items-center">
                <div className="flex flex-col items-center">
                  <div className="w-10">
                    <Globe color={colors["primary-background"]} />
                  </div>
                  <h4 className="mt-6">No projects</h4>
                  <p className="text-sm mt-6">
                    It looks like you haven&apos;t created any projects yet.
                  </p>
                  <p className="text-sm">
                    <a
                      target="_blank"
                      rel="noreferrer"
                      className="text-gitcoin-violet-400"
                      href="https://support.gitcoin.co/gitcoin-knowledge-base/gitcoin-grants-program/project-owners"
                    >
                      Learn More.
                    </a>
                  </p>
                  <Link
                    to={newGrantPath()}
                    className="mt-6"
                    data-track-event="project-create-center-next"
                  >
                    <Button variant={ButtonVariants.outline}>
                      Create a Project
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
          <CallbackModal
            modalOpen={props.showRoundModal}
            confirmText="Apply to Grant Round"
            cancelText="Skip"
            confirmHandler={() => {
              setToggleModal(ApplicationModalStatus.Closed);
              const chainId = roundToApply?.split(":")[0];
              const roundId = roundToApply?.split(":")[1];
              const path = roundPath(chainId, roundId);

              navigate(path);
            }}
            headerImageUri={RoundApply}
            toggleModal={() => setToggleModal(ApplicationModalStatus.Closed)}
            hideCloseButton
          >
            <>
              <h5 className="font-medium mt-5 mb-2 text-lg">
                Time to get your project funded!
              </h5>
              <p className="mb-6">
                Congratulations on creating your project on Builder! Continue to
                apply for{" "}
                {props.round ? props.round!.roundMetadata.name : "the round"}.
              </p>
            </>
          </CallbackModal>
        </>
      )}
    </div>
  );
}

export default ProjectsList;
