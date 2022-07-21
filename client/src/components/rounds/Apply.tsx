import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { RootState } from "../../reducers";
import { roundPath } from "../../routes";
import { Status } from "../../reducers/rounds";
import Form from "../application/Form";
import Button, { ButtonVariants } from "../base/Button";
import ExitModal from "../base/ExitModal";
import Cross from "../icons/Cross";
import colors from "../../styles/colors";

const formatDate = (unixTS: number) =>
  new Date(unixTS).toLocaleDateString(undefined);
function Apply() {
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [modalOpen, toggleModal] = useState(false);

  const props = useSelector((state: RootState) => {
    const { id } = params;
    const roundState = state.rounds[id!];
    const status = roundState ? roundState.status : Status.Empty;
    const error = roundState ? roundState.error : undefined;
    const round = roundState ? roundState.round : undefined;
    return {
      id,
      roundState,
      status,
      error,
      round,
      applicationMetadata: round?.applicationMetadata,
    };
  }, shallowEqual);

  useEffect(() => {
    if (props.id !== undefined && props.round === undefined) {
      navigate(roundPath(props.id));
    }
  }, [dispatch, props.id, props.round]);

  if (props.status === Status.Error) {
    return <div>Error: {props.error}</div>;
  }

  if (props.status !== Status.Loaded) {
    return <div>loading...</div>;
  }

  if (props.roundState === undefined || props.round === undefined) {
    return <div>something went wrong</div>;
  }

  return (
    <div className="mx-4">
      <div className="flex flex-col sm:flex-row justify-between">
        <h3 className="mb-2">Grant Application</h3>
        <div className="w-full mb-2 inline-block sm:hidden">
          <p>Make sure to Save &amp; Exit, so your changes are saved.</p>
        </div>
        <Button
          variant={ButtonVariants.outlineDanger}
          onClick={() => toggleModal(true)}
          styles={["w-full sm:w-auto mx-w-full ml-0"]}
        >
          <i className="icon mt-1.5">
            <Cross color={colors["danger-background"]} />
          </i>{" "}
          <span className="pl-2">Exit</span>
        </Button>
      </div>
      <div className="w-full flex">
        <div className="w-full md:w-1/3 mb-2 hidden sm:inline-block">
          <p className="font-semibold">Your Grant Application to:</p>
          <p>{props.round.roundMetadata.name}</p>
          <p>
            {formatDate(props.round.applicationsStartTime)} -{" "}
            {formatDate(props.round.applicationsEndTime)}
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
