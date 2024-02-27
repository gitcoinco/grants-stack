import Footer from "common/src/components/Footer";
import { Requirement, Round } from "../api/types";
import Navbar from "../common/Navbar";
import { isDirectRound, isInfiniteDate, votingTokens } from "../api/utils";
import { getAddress } from "ethers/lib/utils.js";
import { useToken } from "wagmi";
import { Button } from "common/src/styles";
import { formatUTCDateAsISOString, getUTCTime } from "common";
import ApplyButton from "./ApplyButton";

const builderURL = process.env.REACT_APP_BUILDER_URL;

export default function BeforeRoundStart(props: {
  round: Round;
  chainId: string;
  roundId: string;
}) {
  const { round, chainId, roundId } = props;

  return (
    <>
      <Navbar customBackground="bg-[#F0F0F0]" />
      <div className="relative top-16 px-4 pt-7 h-screen bg-gradient-to-b from-[#F0F0F0] to-[#FFFFFF] h-full">
        <main className="font-sans">
          <PreRoundPage
            round={round}
            chainId={chainId}
            roundId={roundId}
            element={(req: Requirement, index) => (
              <li key={index}>{req.requirement}</li>
            )}
          />
        </main>
        <div className="my-11">
          <Footer />
        </div>
      </div>
    </>
  );
}

function PreRoundPage(props: {
  round: Round;
  chainId: string;
  roundId: string;
  element: (req: Requirement, index: number) => JSX.Element;
}) {
  const { round, chainId, roundId, element } = props;

  const applicationURL = `${builderURL}/#/chains/${chainId}/rounds/${roundId}`;

  const currentTime = new Date();
  const isBeforeApplicationStartDate =
    round && round.applicationsStartTime >= currentTime;
  // covers infinite dates for applicationsEndTime
  const isDuringApplicationPeriod =
    round &&
    round.applicationsStartTime <= currentTime &&
    (isInfiniteDate(round.applicationsEndTime) ||
      round.applicationsEndTime >= currentTime);

  const isAfterApplicationEndDateAndBeforeRoundStartDate =
    round &&
    round.roundStartTime >= currentTime &&
    (isInfiniteDate(round.applicationsEndTime) ||
      round.applicationsEndTime <= currentTime);

  const { data } = useToken({
    address: getAddress(props.round.token),
    chainId: Number(chainId),
  });

  const nativePayoutToken = votingTokens.find(
    (t) =>
      t.chainId === Number(chainId) &&
      t.address === getAddress(props.round.token)
  );

  const tokenData = data ?? {
    ...nativePayoutToken,
    symbol: nativePayoutToken?.name ?? "ETH",
  };

  return (
    <div className="mt-20 flex justify-center">
      <div className="max-w-screen-lg md:w-full">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-modern-era-medium text-grey-500">
            {round.roundMetadata?.name}
          </h1>
          <p
            className="text-lg my-2 font-normal text-grey-400"
            data-testid="application-period"
          >
            Application Period:
            <span className="mx-1">
              <span className="mr-1">
                {formatUTCDateAsISOString(round.applicationsStartTime)}
              </span>

              <span>( {getUTCTime(round.applicationsStartTime)} )</span>

              <span className="mx-1">-</span>

              {!isInfiniteDate(round.applicationsEndTime) && (
                <>
                  <span className="mr-1">
                    {formatUTCDateAsISOString(round.applicationsEndTime)}
                  </span>

                  <span>{getUTCTime(round.applicationsEndTime)}</span>
                </>
              )}
              {isInfiniteDate(round.applicationsEndTime) && (
                <>
                  <span>No End Date</span>
                </>
              )}
            </span>
          </p>
          <p
            className="text-lg my-2 font-normal text-grey-400"
            data-testid="round-period"
          >
            Round Period:
            <span>
              <span className="mx-1">
                {formatUTCDateAsISOString(round.roundStartTime)}
              </span>

              <span>( {getUTCTime(round.roundStartTime)} )</span>

              <span className="mx-1">-</span>

              {!isInfiniteDate(round.roundEndTime) && (
                <>
                  <span className="mr-1">
                    {formatUTCDateAsISOString(round.roundEndTime)}
                  </span>

                  <span>{getUTCTime(round.roundEndTime)}</span>
                </>
              )}
              {isInfiniteDate(round.roundEndTime) && (
                <>
                  <span>No End Date</span>
                </>
              )}
            </span>
          </p>
          {!isDirectRound(round) && (
            <div>
              <p
                className="text-lg my-2 text-grey-400 font-normal"
                data-testid="matching-funds"
              >
                Matching Funds Available:
                <span>
                  {" "}
                  &nbsp;
                  {round.roundMetadata?.quadraticFundingConfig?.matchingFundsAvailable.toLocaleString()}
                  &nbsp;
                  {tokenData?.symbol ?? "..."}
                </span>
              </p>
              <p
                className="text-lg my-2 text-grey-400 font-normal"
                data-testid="matching-cap"
              >
                Matching Cap:
                {round.roundMetadata?.quadraticFundingConfig
                  ?.matchingCapAmount ? (
                  <span>
                    {" "}
                    &nbsp;
                    {
                      round.roundMetadata?.quadraticFundingConfig
                        ?.matchingCapAmount
                    }
                    &nbsp;
                    {"%"}
                  </span>
                ) : (
                  <span>None</span>
                )}
              </p>
            </div>
          )}
          <p className="text-lg my-5 text-grey-400 font-normal border-t py-5 border-b">
            <span>{round.roundMetadata?.eligibility.description}</span>
          </p>
          <p
            className="mb-4 text-2xl font-bold"
            data-testid="round-eligibility"
          >
            Round Eligibility
          </p>
          <div className="container justify-center max-w-fit mx-auto">
            <ul className="list-disc list-inside text-lg text-grey-400 text-left font-normal">
              {round.roundMetadata?.eligibility.requirements?.map(element)}
            </ul>
          </div>
          <div className="container mx-auto flex mt-4 mb-8 lg:w-96">
            {isBeforeApplicationStartDate && (
              <InactiveButton
                label="Apply to Grant Round"
                testid="applications-open-button"
              />
            )}

            {isDuringApplicationPeriod && (
              <ApplyButton applicationURL={applicationURL} />
            )}

            {isAfterApplicationEndDateAndBeforeRoundStartDate && (
              <InactiveButton
                label="Application period ended"
                testid="applications-closed-button"
              />
            )}
          </div>
        </div>
        <div className="basis-1/2 right-0"></div>
      </div>
    </div>
  );
}

const InactiveButton = (props: { label: string; testid: string }) => {
  const { label, testid } = props;

  return (
    <Button
      type="button"
      className="basis-full items-center justify-center shadow-sm text-sm bg-grey-300 rounded border-1 md:h-12"
      data-testid={testid}
      disabled={true}
    >
      {label}
    </Button>
  );
};
