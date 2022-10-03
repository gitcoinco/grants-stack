import { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import useLocalStorage from "../../hooks/useLocalStorage";
import { RootState } from "../../reducers";
import { Status as ApplicationStatus } from "../../reducers/roundApplication";
import { Status as RoundStatus } from "../../reducers/rounds";
import { roundPath } from "../../routes";
import colors from "../../styles/colors";
import Form from "../application/Form";
import Button, { ButtonVariants } from "../base/Button";
import ExitModal from "../base/ExitModal";
import Cross from "../icons/Cross";

const formatDate = (unixTS: number) =>
  new Date(unixTS).toLocaleDateString(undefined);

function Apply() {
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [modalOpen, toggleModal] = useState(false);
  const [, setRoundToApply] = useLocalStorage("roundToApply", null);
  const [, setToggleRoundApplicationModal] = useLocalStorage(
    "toggleRoundApplicationModal",
    false
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

    return {
      roundState,
      roundStatus,
      roundError,
      round,
      applicationStatus,
      applicationError,
      applicationMetadata: round?.applicationMetadata,
    };
  }, shallowEqual);

  useEffect(() => {
    if (
      roundId !== undefined &&
      chainId !== undefined &&
      props.round === undefined
    ) {
      navigate(roundPath(chainId, roundId));
    }
  }, [dispatch, roundId, props.round]);

  useEffect(() => {
    if (roundId) {
      setRoundToApply(`${chainId}:${roundId}`);
      setToggleRoundApplicationModal(true);
    }
  }, [roundId]);

  if (props.roundStatus === RoundStatus.Error) {
    return <div>Error loading round data: {props.roundError}</div>;
  }

  if (props.roundStatus !== RoundStatus.Loaded) {
    return <div>loading...</div>;
  }

  if (props.roundState === undefined || props.round === undefined) {
    return <div>something went wrong</div>;
  }

  if (props.applicationStatus === ApplicationStatus.Error) {
    return (
      <div>Error submitting round application: {props.applicationError}</div>
    );
  }

  if (props.applicationStatus === ApplicationStatus.Sent) {
    return <div>Applied to round successfully.</div>;
  }

  if (props.applicationStatus !== ApplicationStatus.Undefined) {
    return <div>sending application...</div>;
  }

  return (
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
          <p className="font-semibold mt-4">Application Date</p>
          <p>
            {formatDate(props.round.applicationsStartTime * 1000)} -{" "}
            {formatDate(props.round.applicationsEndTime * 1000)}
          </p>
          <p className="font-semibold mt-4">Round Date</p>
          <p>
            {formatDate(props.round.roundStartTime * 1000)} -{" "}
            {formatDate(props.round.roundEndTime * 1000)}
          </p>
        </div>
        <div className="w-full md:w-2/3">
          {!props.applicationMetadata === undefined && (
            <div>loading form...</div>
          )}
          {props.applicationMetadata !== undefined && (
            <Form
              roundApplication={props.applicationMetadata}
              round={props.round}
            />
          )}
        </div>
      </div>

      <ExitModal modalOpen={modalOpen} toggleModal={toggleModal} />
    </div>
  );
}

export default Apply;
