import { useAllo } from "common";
import { RoundCategory, useDataLayer } from "data-layer";
import { RoundApplicationAnswers } from "data-layer/dist/roundApplication.types";
import { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useAlloVersion } from "common/src/components/AlloVersionSwitcher";
import { AlloVersion } from "data-layer/dist/data-layer.types";
import {
  resetApplication,
  submitApplication,
} from "../../actions/roundApplication";
import { addAlert } from "../../actions/ui";
import useLocalStorage from "../../hooks/useLocalStorage";
import { RootState } from "../../reducers";
import {
  ApplicationModalStatus,
  Status as ApplicationStatus,
} from "../../reducers/roundApplication";
import { Status as RoundStatus } from "../../reducers/rounds";
import { grantsPath, projectPath, roundPath } from "../../routes";
import colors from "../../styles/colors";
import { Round } from "../../types";
import { isInfinite } from "../../utils/components";
import { getApplicationSteps } from "../../utils/steps";
import Form from "../application/Form";
import Button, { ButtonVariants } from "../base/Button";
import ErrorModal from "../base/ErrorModal";
import ExitModal from "../base/ExitModal";
import PurpleNotificationBox from "../base/PurpleNotificationBox";
import StatusModal from "../base/StatusModal";
import Cross from "../icons/Cross";

const formatDate = (unixTS: number) =>
  new Date(unixTS).toLocaleDateString(undefined);

function Apply() {
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dataLayer = useDataLayer();
  const allo = useAllo();
  const { version: alloVersion, switchToVersion } = useAlloVersion();

  const [createLinkedProject, setCreateLinkedProject] = useState(false);
  const [modalOpen, toggleModal] = useState(false);
  const [roundData, setRoundData] = useState<Round>();
  const [statusModalOpen, toggleStatusModal] = useState(false);
  const [, setRoundToApply] = useLocalStorage("roundToApply", null);
  const [roundApplicationModal, setToggleRoundApplicationModal] =
    useLocalStorage(
      "toggleRoundApplicationModal",
      ApplicationModalStatus.Undefined
    );

  const { roundId, chainId } = params;

  const props = useSelector((state: RootState) => {
    const roundState = state.rounds[roundId!];
    const roundStatus = roundState ? roundState.status : RoundStatus.Undefined;
    const applicationState = state.roundApplication[roundId!];
    const applicationStatus: ApplicationStatus = applicationState
      ? applicationState.status
      : ApplicationStatus.Undefined;

    const roundError = roundState ? roundState.error : undefined;
    const round = roundState ? roundState.round : undefined;

    const applicationError = applicationState
      ? applicationState.error
      : undefined;
    const showErrorModal =
      applicationError && applicationStatus === ApplicationStatus.Error;

    return {
      roundState,
      roundStatus,
      roundError,
      round,
      applicationState,
      applicationStatus,
      applicationError,
      applicationMetadata: round?.applicationMetadata,
      showErrorModal,
    };
  }, shallowEqual);

  const isDirectRound = props.round?.payoutStrategy === RoundCategory.Direct;

  /*
   * Alert elements
   */
  const applicationSuccessTitle: string = `Thank you for applying to ${roundData?.programName} ${roundData?.roundMetadata.name}!`;
  const applicationSuccessBody: string = `Your application has been received, and the ${roundData?.programName} team
    will review and reach out with next steps.`;

  useEffect(() => {
    if (props.round) {
      setRoundData(props.round);

      if (!props.round.tags.includes(alloVersion)) {
        const roundVersion = props.round.tags.find((tag) =>
          tag.startsWith("allo-")
        );
        if (roundVersion === undefined) {
          throw new Error("no allo version found, should never happen");
        }
        switchToVersion(roundVersion as AlloVersion);
      }
    }
  }, [props.round]);

  useEffect(() => {
    if (
      roundId !== undefined &&
      chainId !== undefined &&
      props.round === undefined
    ) {
      navigate(roundPath(chainId, roundId));
    }
  }, [dispatch, roundId, props.round]);

  // set localstorage variables
  // on unload reset round application status
  useEffect(() => {
    if (roundId) {
      setRoundToApply(`${chainId}:${roundId}`);

      if (roundApplicationModal === ApplicationModalStatus.Undefined) {
        setToggleRoundApplicationModal(ApplicationModalStatus.NotApplied);
      }
    }

    return () => {
      if (roundId !== undefined) {
        dispatch(resetApplication(roundId));
      }
    };
  }, [roundId, resetApplication]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (
      props.applicationState &&
      props.applicationState.status === ApplicationStatus.Sent
    ) {
      timer = setTimeout(() => {
        dispatch(
          addAlert("success", applicationSuccessTitle, applicationSuccessBody)
        );
        const id = props.applicationState.projectsIDs[0].toString();

        // Note: this is a hack to navigate to the project page after the application is submitted
        // todo: later remove the entire registry path from the url
        navigate(projectPath(chainId as string, "0x", id));
      }, 1500);
    }

    return () => {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    };
  }, [props.applicationState]);

  useEffect(() => {
    if (
      props.applicationState?.status === ApplicationStatus.Error ||
      props.applicationError
    ) {
      toggleStatusModal(false);
    }
  }, [props.applicationStatus, props.applicationError]);

  if (props.roundStatus === RoundStatus.Error) {
    <div>
      <ErrorModal
        open
        primaryBtnText="Refresh Page"
        secondaryBtnText="Close"
        onClose={() => navigate(grantsPath())}
        onRetry={() => navigate(0)}
      >
        <>
          There has been an error loading the grant round data. Please try
          refreshing the page. If the issue persists, please reach out to us on{" "}
          <a
            target="_blank"
            className="text-gitcoin-violet-400 outline-none"
            href="https://discord.com/invite/gitcoin"
            rel="noreferrer"
          >
            Discord.
          </a>
        </>
      </ErrorModal>
    </div>;
  }

  if (props.roundStatus !== RoundStatus.Loaded) {
    return <div>loading...</div>;
  }

  if (props.roundState === undefined || props.round === undefined) {
    return (
      <div>
        <ErrorModal
          open
          primaryBtnText="Close"
          secondaryBtnText="Refresh Page"
          onRetry={() => navigate(grantsPath())}
          onClose={() => navigate(0)}
        >
          <>
            There has been an error loading the round data. Please try
            refreshing the page. If the issue persists, please reach out to us
            on{" "}
            <a
              target="_blank"
              className="text-gitcoin-violet-400 outline-none"
              href="https://discord.com/invite/gitcoin"
              rel="noreferrer"
            >
              Discord.
            </a>
          </>
        </ErrorModal>
      </div>
    );
  }

  return (
    <>
      <div className="sm:w-full mx-4">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="w-full sm:w-1/3 flex flex-col sm:flex-row">
            <h3>Grant Round Application</h3>
            {/* <div className="w-full mb-2 inline-block sm:hidden">
              <p>Make sure to Save &amp; Exit, so your changes are saved.</p>
            </div> */}
          </div>
          <div className="w-full sm:w-2/3 flex sm:flex-row flex-col items-center justify-between">
            <div className="flex flex-row" />
            <Button
              variant={ButtonVariants.outlineDanger}
              onClick={() => toggleModal(true)}
              styles={["w-full sm:w-auto mx-w-full ml-0"]}
            >
              <i className="icon mt-1">
                <Cross color={colors["danger-background"]} />
              </i>{" "}
              <span className="pl-2">Exit</span>
            </Button>
          </div>
        </div>
        <div className="w-full flex">
          <div className="w-full md:w-1/3 mb-2 hidden sm:inline-block">
            <p className="font-semibold">Grant Round</p>
            <p>{props.round.programName}</p>
            <p>{props.round.roundMetadata.name}</p>
            {!isDirectRound && (
              <>
                <p className="font-semibold mt-4">Application Period:</p>
                <p>
                  {formatDate(props.round.applicationsStartTime * 1000)} -{" "}
                  {isInfinite(props.round.applicationsEndTime) ||
                  !props.round.applicationsEndTime
                    ? "No End Date"
                    : formatDate(props.round.applicationsEndTime * 1000)}
                </p>
              </>
            )}
            <p className="font-semibold mt-4">Round Dates:</p>
            <p>
              {formatDate(props.round.roundStartTime * 1000)} -{" "}
              {isInfinite(props.round.applicationsEndTime) ||
              !props.round.applicationsEndTime
                ? "No End Date"
                : formatDate(props.round.roundEndTime * 1000)}
            </p>
            {/* tslint:disable-next-line:max-line-length */}
            <PurpleNotificationBox className="mt-5">
              Make sure your project details are correct as you will NOT be able
              to edit or re-apply once you submit this application.
            </PurpleNotificationBox>
            <p className="mt-4">
              Need Help? Check out the{" "}
              <a
                target="_blank"
                rel="noreferrer"
                className="text-gitcoin-violet-400"
                href="https://support.gitcoin.co/gitcoin-knowledge-base/gitcoin-grants-program/project-owners"
              >
                Builder Guide.
              </a>
            </p>
          </div>
          <div className="w-full md:w-2/3">
            {!props.applicationMetadata === undefined && (
              <div>loading form...</div>
            )}
            {props.applicationMetadata !== undefined && (
              <Form
                roundApplication={props.applicationMetadata}
                showErrorModal={props.showErrorModal || false}
                round={props.round}
                onSubmit={(
                  answers: RoundApplicationAnswers,
                  createProfile: boolean
                ) => {
                  if (allo === null) {
                    return;
                  }
                  dispatch(
                    submitApplication(
                      props.round!.id,
                      answers,
                      allo,
                      createProfile,
                      dataLayer
                    )
                  );
                  toggleStatusModal(true);
                }}
                setCreateLinkedProject={setCreateLinkedProject}
              />
            )}
          </div>
        </div>
        <ExitModal modalOpen={modalOpen} toggleModal={toggleModal} />
      </div>

      {props.applicationState !== undefined &&
        props.applicationState.status !== ApplicationStatus.Undefined && (
          <StatusModal
            open={statusModalOpen}
            onClose={toggleStatusModal}
            currentStatus={props.applicationState.status}
            steps={getApplicationSteps(createLinkedProject)}
            error={props.applicationState.error}
            title="Please hold while we submit your grant round application."
          />
        )}
    </>
  );
}

export default Apply;
