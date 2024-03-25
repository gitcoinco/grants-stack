/* eslint-disable no-nested-ternary */
import { ChainId } from "common";
import { RoundCategory, useDataLayer } from "data-layer";
import { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSwitchNetwork } from "wagmi";
import { useAlloVersion } from "common/src/components/AlloVersionSwitcher";
import { AlloVersion } from "data-layer/dist/data-layer.types";
import { loadAllChainsProjects } from "../../actions/projects";
import { loadRound, unloadRounds } from "../../actions/rounds";
import useLocalStorage from "../../hooks/useLocalStorage";
import { RootState } from "../../reducers";
import { GrantsMetadataState } from "../../reducers/grantsMetadata";
import { Status as ProjectStatus } from "../../reducers/projects";
import { ApplicationModalStatus } from "../../reducers/roundApplication";
import { Status } from "../../reducers/rounds";
import { grantsPath, newGrantPath, roundApplicationPath } from "../../routes";
import { Round } from "../../types";
import { formatTimeUTC, isInfinite } from "../../utils/components";
import { networkPrettyName } from "../../utils/wallet";
import Button, { ButtonVariants } from "../base/Button";
import ErrorModal from "../base/ErrorModal";
import LoadingSpinner from "../base/LoadingSpinner";
import SwitchNetworkModal from "../base/SwitchNetworkModal";

interface ApplyButtonProps {
  round: Round;
  applicationsHaveStarted: boolean;
  applicationsHaveEnded: boolean;
  projects: GrantsMetadataState;
  chainId: ChainId;
  roundId: string | undefined;
}

function ApplyButton(props: ApplyButtonProps) {
  const {
    round,
    applicationsHaveStarted,
    applicationsHaveEnded,
    projects,
    chainId,
    roundId,
  } = props;

  if (applicationsHaveEnded) {
    return (
      <>
        <Button
          styles={[
            "w-full justify-center bg-gitcoin-grey-300 border-0 font-medium text-white py-3 shadow-gitcoin-sm opacity-100 m-0",
          ]}
          variant={ButtonVariants.primary}
          disabled
        >
          Application Period Ended
        </Button>
        <div className="text-center flex flex-1 flex-col mt-6 text-secondary-text">
          <span>The application period for this round has ended.</span>
          <span>
            If you&apos;ve applied to this round, view your projects on{" "}
            <Link to={grantsPath()} className="text-gitcoin-violet-400">
              My Projects.
            </Link>
          </span>
        </div>
      </>
    );
  }

  if (!applicationsHaveStarted) {
    return (
      <>
        <Button
          styles={[
            "w-full justify-center bg-gitcoin-grey-300 border-0 font-medium text-white py-3 shadow-gitcoin-sm opacity-100 m-0",
          ]}
          variant={ButtonVariants.primary}
          disabled
        >
          Apply
        </Button>
        <div className="text-center flex flex-1 flex-col mt-6 text-secondary-text">
          <span>The application period for this round will start on</span>
          <span>{formatTimeUTC(round.applicationsStartTime)}</span>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-1 flex-col w-full">
      {Object.keys(projects).length !== 0 ? (
        <Link to={roundApplicationPath(chainId.toString()!, roundId!)}>
          <Button
            styles={[
              "w-full justify-center border-0 font-medium py-3 shadow-gitcoin-sm m-0",
            ]}
            variant={ButtonVariants.primary}
          >
            Apply
          </Button>
        </Link>
      ) : (
        <Link to={newGrantPath()}>
          <Button
            styles={[
              "w-full justify-center border-0 font-medium py-3 shadow-gitcoin-sm m-0",
            ]}
            variant={ButtonVariants.primary}
          >
            Create Project
          </Button>
        </Link>
      )}
    </div>
  );
}

function ShowRound() {
  const [roundData, setRoundData] = useState<any>();
  const dataLayer = useDataLayer();
  const { version: alloVersion, switchToVersion } = useAlloVersion();

  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { switchNetwork } = useSwitchNetwork();

  const { roundId, chainId } = params;

  const props = useSelector((state: RootState) => {
    const allProjectMetadata = state.grantsMetadata;
    const projectsStatus = state.projects.status;
    const roundState = state.rounds[roundId!];
    const status = roundState ? roundState.status : Status.Undefined;
    const error = roundState ? roundState.error : undefined;
    const round = roundState ? roundState.round : undefined;
    const web3ChainId = state.web3.chainID;
    const roundChainId = Number(chainId);

    const now = new Date().getTime() / 1000;

    let applicationsHaveStarted = false;
    let applicationsHaveEnded = false;
    let votingHasStarted = false;
    let votingHasEnded = false;

    // covers QF and DF application and voting periods condition evaluation
    if (
      roundState?.round &&
      roundState?.round?.applicationsStartTime !== undefined &&
      roundState?.round?.roundStartTime !== undefined
    ) {
      applicationsHaveStarted = roundState.round?.applicationsStartTime <= now;
      votingHasStarted = roundState.round?.roundStartTime <= now;
    }
    if (
      roundState?.round &&
      roundState?.round?.applicationsEndTime !== undefined &&
      roundState?.round?.roundEndTime !== undefined
    ) {
      applicationsHaveEnded = roundState.round?.applicationsEndTime <= now;
      votingHasEnded = roundState.round?.roundEndTime <= now;
    }

    return {
      roundState,
      status,
      error,
      round,
      web3ChainId,
      roundChainId,
      projects: allProjectMetadata,
      projectsStatus,
      applicationsHaveStarted,
      applicationsHaveEnded,
      votingHasStarted,
      votingHasEnded,
    };
  }, shallowEqual);

  const renderApplicationDate = () =>
    roundData && (
      <>
        {formatTimeUTC(roundData.applicationsStartTime)} -{" "}
        {isInfinite(roundData.applicationsEndTime) ||
        !roundData.applicationsEndTime
          ? "No End Date"
          : formatTimeUTC(roundData.applicationsEndTime)}
      </>
    );

  const renderRoundDate = () =>
    roundData && (
      <>
        {formatTimeUTC(roundData.roundStartTime)} -{" "}
        {isInfinite(roundData.roundEndTime) || !roundData.roundEndTime
          ? "No End Date"
          : formatTimeUTC(roundData.roundEndTime)}
        {}
      </>
    );

  const [, setRoundToApply] = useLocalStorage("roundToApply", null);
  const [roundApplicationModal, setToggleRoundApplicationModal] =
    useLocalStorage(
      "toggleRoundApplicationModal",
      ApplicationModalStatus.Undefined
    );

  const isOnRoundChain = props.web3ChainId === props.roundChainId;

  useEffect(() => {
    if (!isOnRoundChain) return;

    if (roundId && !props.applicationsHaveEnded) {
      setRoundToApply(`${chainId}:${roundId}`);

      if (roundApplicationModal === ApplicationModalStatus.Undefined) {
        setToggleRoundApplicationModal(ApplicationModalStatus.NotApplied);
      }
    }
  }, [roundId, props.applicationsHaveEnded]);

  useEffect(() => {
    if (roundId !== undefined) {
      dispatch(unloadRounds());
      dispatch(
        loadRound(
          roundId,
          dataLayer,
          Number(props.roundChainId || props.web3ChainId)
        )
      );
    }
  }, [dispatch, roundId]);

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
    if (props.projectsStatus === ProjectStatus.Undefined) {
      dispatch(loadAllChainsProjects(dataLayer, true));
    }
  }, [props.projectsStatus, dispatch]);

  const onSwitchNetwork = () => {
    if (switchNetwork) {
      switchNetwork(props.roundChainId);
    }
  };

  const renderNetworkChangeModal = () => {
    const roundNetworkName = networkPrettyName(props.roundChainId);
    return (
      // eslint-disable-next-line
      <SwitchNetworkModal
        networkName={roundNetworkName}
        onSwitchNetwork={onSwitchNetwork}
      />
    );
  };

  if (props.status === Status.Error) {
    return (
      <div>
        <ErrorModal
          open
          secondaryBtnText="Close"
          primaryBtnText="Refresh Page"
          onRetry={() => navigate(grantsPath())}
          onClose={() => navigate(0)}
        >
          <>
            There has been an error loading the grant round data. Please try
            refreshing the page. If the issue persists, please reach out to our{" "}
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
      </div>
    );
  }

  if (
    props.status !== Status.Loaded ||
    props.projectsStatus !== ProjectStatus.Loaded
  ) {
    return (
      <LoadingSpinner
        label="Loading Round"
        size="24"
        thickness="6px"
        showText
      />
    );
  }

  if (props.roundState === undefined || props.round === undefined) {
    return (
      <div>
        <ErrorModal
          open
          secondaryBtnText="Close"
          primaryBtnText="Refresh Page"
          onRetry={() => navigate(grantsPath())}
          onClose={() => navigate(0)}
        >
          <>
            There has been an error loading the grant round data. Please try
            refreshing the page. If the issue persists, please reach out to our{" "}
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
      </div>
    );
  }
  const isDirectRound = props.round?.payoutStrategy === RoundCategory.Direct;

  return (
    <div
      className="h-full w-full flex flex-col justify-center items-center"
      data-testid="show-round-container"
    >
      <div className="w-full lg:w-1/3 sm:w-2/3 px-4 md:mx-0">
        <h2 className="text-center uppercase text-2xl">
          {roundData?.programName}
        </h2>
        <h2 className="text-center text-2xl">
          {roundData?.roundMetadata.name}
        </h2>
        <div className="flex flex-col mt-3 mb-8 text-secondary-text">
          {/* <div className="flex flex-1 flex-col mt-12">
                <span>Matching Funds Available:</span>
                <span>$XXX,XXX</span>
              </div> */}
          <div className="flex flex-1 flex-col mt-8">
            <span>{roundData?.roundMetadata.eligibility?.description}</span>
          </div>
          {!isDirectRound && (
            <div className="flex flex-1 flex-col mt-8">
              <span className="mb-2">Application Period:</span>
              <span>{renderApplicationDate()}</span>
            </div>
          )}
          <div className="flex flex-1 flex-col mt-8">
            <span className="mb-2">Round Dates:</span>
            <span>{renderRoundDate()}</span>
          </div>
          <div className="flex flex-1 flex-col mt-8">
            <span className="mb-2">Eligibility Requirements:</span>
            {roundData?.roundMetadata?.eligibility?.requirements.map(
              (r: { requirement: string }, index: number) => (
                <span className="mb-2" key={`${index + 1}. ${r.requirement}`}>
                  {`${index + 1}. ${r.requirement}`}
                  <br />
                </span>
              )
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col mt-8">
          <ApplyButton
            round={props.round}
            applicationsHaveStarted={props.applicationsHaveStarted}
            applicationsHaveEnded={props.applicationsHaveEnded}
            projects={props.projects}
            roundId={roundId}
            chainId={props.roundChainId}
          />
        </div>
      </div>
      {!isOnRoundChain && renderNetworkChangeModal()}
    </div>
  );
}

export default ShowRound;
