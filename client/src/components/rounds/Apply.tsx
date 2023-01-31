import { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { resetApplication } from "../../actions/roundApplication";
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
import { applicationSteps } from "../../utils/steps";
import { getProjectURIComponents } from "../../utils/utils";
import Form from "../application/Form";
import Button, { ButtonVariants } from "../base/Button";
import ErrorModal from "../base/ErrorModal";
import ExitModal from "../base/ExitModal";
import Cross from "../icons/Cross";
import StatusModal from "../base/StatusModal";

const formatDate = (unixTS: number) =>
  new Date(unixTS).toLocaleDateString(undefined);

function Apply() {
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  /*
   * Alert elements
   */
  const applicationSuccessTitle: string = `Thank you for applying to ${roundData?.programName} ${roundData?.roundMetadata.name}!`;
  const applicationSuccessBody: string = `Your application has been received, and the ${roundData?.programName} team
    will review and reach out with next steps.`;

  useEffect(() => {
    if (props.round) {
      setRoundData(props.round);
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
    if (props.applicationState?.status === ApplicationStatus.Sent) {
      timer = setTimeout(() => {
        dispatch(
          addAlert("success", applicationSuccessTitle, applicationSuccessBody)
        );
        const {
          chainId: projectChainId,
          registryAddress,
          id,
        } = getProjectURIComponents(
          props.applicationState.projectsIDs[0].toString()
        );
        navigate(projectPath(projectChainId, registryAddress, id));
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
            There has been an error loading the grant round data. Please try
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
      <div className="mx-4">
        <div className="flex flex-col sm:flex-row justify-between">
          <h3 className="mb-2">Grant Round Application</h3>
          <div className="w-full mb-2 inline-block sm:hidden">
            <p>Make sure to Save &amp; Exit, so your changes are saved.</p>
          </div>
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
        <div className="w-full flex">
          <div className="w-full md:w-1/3 mb-2 hidden sm:inline-block">
            <p className="font-semibold">Grant Round</p>
            <p>{props.round.programName}</p>
            <p>{props.round.roundMetadata.name}</p>
            <p className="font-semibold mt-4">Application Period:</p>
            <p>
              {formatDate(props.round.applicationsStartTime * 1000)} -{" "}
              {formatDate(props.round.applicationsEndTime * 1000)}
            </p>
            <p className="font-semibold mt-4">Round Dates:</p>
            <p>
              {formatDate(props.round.roundStartTime * 1000)} -{" "}
              {formatDate(props.round.roundEndTime * 1000)}
            </p>
            <p className="mt-4">
              Need Help? Check out the{" "}
              <a
                target="_blank"
                rel="noreferrer"
                className="text-gitcoin-violet-400"
                href="https://support.gitcoin.co/gitcoin-grants-protocol"
              >
                Grants Hub Guide.
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
                onSubmit={() => {
                  toggleStatusModal(true);
                }}
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
            steps={applicationSteps}
            error={props.applicationState.error}
            title="Please hold while we submit your grant round application."
          />
        )}
    </>
  );
}

export default Apply;
