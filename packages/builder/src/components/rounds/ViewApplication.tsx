import { useAllo } from "common";
import { RoundCategory, useDataLayer } from "data-layer";
import { RoundApplicationAnswers } from "data-layer/dist/roundApplication.types";
import { useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchApplicationData,
  submitApplication,
} from "../../actions/roundApplication";
import { loadRound, unloadRounds } from "../../actions/rounds";
import { RootState } from "../../reducers";
import { Status as ApplicationStatus } from "../../reducers/roundApplication";
import { Status as RoundStatus } from "../../reducers/rounds";
import { grantsPath, projectPath } from "../../routes";
import colors from "../../styles/colors";
import { isInfinite } from "../../utils/components";
import Form from "../application/Form";
import Button, { ButtonVariants } from "../base/Button";
import ErrorModal from "../base/ErrorModal";
import LoadingSpinner from "../base/LoadingSpinner";
import Cross from "../icons/Cross";

const formatDate = (unixTS: number) =>
  new Date(unixTS).toLocaleDateString(undefined);

function ViewApplication() {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const allo = useAllo();

  const dataLayer = useDataLayer();

  const { chainId, roundId, ipfsHash } = params;

  const props = useSelector((state: RootState) => {
    const roundState = state.rounds[roundId!];
    const roundStatus = roundState ? roundState.status : RoundStatus.Undefined;
    const applicationState = state.roundApplication[roundId!];
    const applicationStatus: ApplicationStatus = applicationState
      ? applicationState.status
      : ApplicationStatus.Undefined;

    const roundError = roundState ? roundState.error : undefined;
    const round = roundState ? roundState.round : undefined;
    const publishedApplicationMetadata = applicationState
      ? applicationState.metadataFromIpfs![ipfsHash!]
      : undefined;
    const showErrorModal =
      !!publishedApplicationMetadata?.publishedApplicationData?.error;

    const roundApplicationStatus =
      publishedApplicationMetadata?.status ?? "IN_REVIEW";

    const web3ChainId = state.web3.chainID;
    const roundChainId = Number(chainId);
    const projectId =
      publishedApplicationMetadata?.publishedApplicationData?.application
        ?.project?.id;

    return {
      roundState,
      roundStatus,
      roundError,
      round,
      applicationState,
      applicationStatus,
      applicationMetadata: round?.applicationMetadata,
      publishedApplicationMetadata,
      showErrorModal,
      web3ChainId,
      roundChainId,
      projectId,
      roundApplicationStatus,
    };
  }, shallowEqual);

  useEffect(() => {
    if (roundId !== undefined || !props.publishedApplicationMetadata) {
      dispatch(unloadRounds());
      dispatch(loadRound(roundId!, dataLayer, props.roundChainId));
    }
  }, [dispatch, roundId]);

  useEffect(() => {
    if (!props.round) return;

    if (params.ipfsHash !== undefined) {
      dispatch(fetchApplicationData(ipfsHash!, roundId!));
    }
  }, [dispatch, params.ipfsHash, props.round]);

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

  const isDirectRound = props.round?.payoutStrategy === RoundCategory.Direct;
  const roundInReview = props.roundApplicationStatus === "IN_REVIEW";
  const roundApproved = props.roundApplicationStatus === "APPROVED";
  const hasProperStatus = roundInReview || roundApproved;

  if (
    props.roundState === undefined ||
    props.round === undefined ||
    props.publishedApplicationMetadata === undefined
  ) {
    return (
      <LoadingSpinner
        label="Loading Application"
        size="24"
        thickness="6px"
        showText
      />
    );
  }

  return (
    <div className="mx-4">
      <div className="flex flex-col sm:flex-row justify-between my-5">
        <h3 className="mb-2">Grant Round Application</h3>
        <Button
          variant={ButtonVariants.outlineDanger}
          onClick={() => {
            const path = projectPath(chainId as string, "0x", props.projectId!);
            if (path !== undefined) {
              navigate(path);
            } else {
              console.error(
                `cannot build project path from id: ${props.projectId}`
              );
            }
          }}
          styles={["w-full sm:w-auto mx-w-full ml-0"]}
        >
          <i className="icon mt-1.5">
            <Cross color={colors["grey-text"]} />
          </i>
          <span className="pl-2 text-gitcoin-grey-500">Exit</span>
        </Button>
      </div>
      <div className="w-full flex">
        <div className="w-full md:w-1/3 mb-2 hidden sm:inline-block">
          <p className="font-semibold">Grant Round</p>
          <p>{props.round.programName ?? ""}</p>
          <p>{props.round.roundMetadata.name}</p>
          {isDirectRound && hasProperStatus && (
            <>
              <p className="font-semibold mt-4">Contact Information:</p>
              <a
                className="text-purple-500"
                target="_blank"
                href={`${
                  props.round.roundMetadata.support?.type === "Email"
                    ? "mailto:"
                    : ""
                }
                ${props.round.roundMetadata.support?.info}`}
                rel="noreferrer"
              >
                {props.round.roundMetadata.support?.info}
              </a>
            </>
          )}
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
            <LoadingSpinner
              label="Loading Application Form"
              size="24"
              thickness="6px"
              showText
            />
          )}
          {props.applicationMetadata && (
            <Form
              roundApplication={props.applicationMetadata}
              publishedApplication={
                props.publishedApplicationMetadata.publishedApplicationData
              }
              showErrorModal={props.showErrorModal || false}
              round={props.round}
              onSubmit={(
                answers: RoundApplicationAnswers,
                createLinkedProject: boolean
              ) => {
                if (allo === null) {
                  return;
                }
                dispatch(
                  submitApplication(
                    props.round!.id,
                    answers,
                    allo,
                    createLinkedProject,
                    dataLayer
                  )
                );
              }}
              readOnly
              setCreateLinkedProject={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewApplication;
