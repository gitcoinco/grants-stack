import { datadogLogs } from "@datadog/browser-logs";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../common/Navbar";
import { Button } from "../common/styles";
import Footer from "../common/Footer";
import { ArrowPathIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import {
  fetchPassport,
  PassportResponse,
  PassportState,
  submitPassport,
} from "../api/passport";
import { ReactComponent as PassportLogo } from "../../assets/passport-logo.svg";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

export default function PassportConnect() {
  datadogLogs.logger.info(
    "====> Route: /round/:chainId/:roundId/passport/connect"
  );
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const navigate = useNavigate();

  const { chainId, roundId } = useParams();

  const PASSPORT_COMMUNITY_ID = process.env.REACT_APP_PASSPORT_API_COMMUNITY_ID; // TODO: fetch from round metadata

  const [passport, setPassport] = useState<PassportResponse | undefined>();
  const [, setError] = useState<Response | undefined>();
  const { address, isConnected } = useAccount();

  const [passportState, setPassportState] = useState<PassportState>(
    PassportState.LOADING
  );

  const callFetchPassport = async () => {
    if (!address || !PASSPORT_COMMUNITY_ID) {
      setPassportState(PassportState.NOT_CONNECTED);
      return;
    }

    const res = await fetchPassport(address, PASSPORT_COMMUNITY_ID);

    if (!res) {
      setPassportState(PassportState.ERROR);
      return;
    }

    if (res.ok) {
      const scoreResponse: PassportResponse = await res.json();

      // TODO: Handle exponential backoff
      if (scoreResponse.status == "PROCESSING") {
        await callFetchPassport();
        return;
      }

      if (!scoreResponse.score || !scoreResponse.evidence) {
        setPassportState(PassportState.ERROR);
        return;
      }

      setPassport(scoreResponse);
      setPassportState(
        scoreResponse.evidence.rawScore >= scoreResponse.evidence.threshold
          ? PassportState.MATCH_ELIGIBLE
          : PassportState.MATCH_INELIGIBLE
      );
    } else {
      setError(res);
      switch (res.status) {
        case 400: // unregistered/nonexistent passport address
          setPassportState(PassportState.INVALID_PASSPORT);
          console.error(
            "unregistered/nonexistent passport address",
            res.json()
          );
          break;
        case 401: // invalid API key
          setPassportState(PassportState.ERROR);
          console.error("invalid API key", res.json());
          break;
        default:
          setPassportState(PassportState.ERROR);
          console.error("Error fetching passport", res);
      }
    }
  };

  useEffect(() => {
    setPassportState(PassportState.LOADING);
    if (isConnected) {
      callFetchPassport();
    } else {
      setPassportState(PassportState.NOT_CONNECTED);
    }
  }, [address, isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  const updatePassportScore = async () => {
    if (!address || !PASSPORT_COMMUNITY_ID) return;

    setPassportState(PassportState.LOADING);
    submitPassport(address, PASSPORT_COMMUNITY_ID)
      .then(() => {
        callFetchPassport();
      })
      .catch((err) => {
        console.error("Error submitting passport", err);
        setPassportState(PassportState.ERROR);
      });
  };

  function HaveAPassportInstructions() {
    return (
      <div
        data-testid="have-a-passport-instructions"
        className="text-left mt-8 mb-5 text-grey-500 max-w-7xl mx-auto"
      >
        <div className="text-[18px] mb-6 flex">
          <div className="bg-violet-200 w-24 md:w-8 h-8 rounded-full relative mr-4">
            <div className="absolute mt-1 ml-3">1</div>
          </div>
          <div className="my-auto">
            Create a Passport if you don’t have one already. You will be taken
            to a new window to begin verifying your identity.
          </div>
        </div>
        <div className="text-[18px] mb-6 flex">
          <div className="bg-violet-200 w-12 md:w-8 h-8 rounded-full relative mr-4">
            <div className="absolute mt-1 m-[10px]">2</div>
          </div>
          <div className="my-auto">
            Verify your identity by connecting to various stamps.
          </div>
        </div>
        <div className="text-[18px] mb-6 flex">
          <div className="bg-violet-200 w-12 md:w-8 h-8 rounded-full relative mr-4">
            <div className="absolute mt-1 m-[10px]">3</div>
          </div>
          <div className="my-auto">
            Return back to this screen and recalculate your score.
          </div>
        </div>
        <div className="text-[18px] mb-6 flex">
          <div className="bg-violet-200 w-28 md:w-8 h-8 rounded-full relative mr-4">
            <div className="absolute mt-1 m-[10px]">4</div>
          </div>
          <div className="my-auto">
            If ineligible, you will have the chance to verify more stamps to
            raise your score. Once you have, recalculate your score.
          </div>
        </div>
        <div className="text-[18px] mb-6 flex">
          <div className="bg-violet-200 w-9 md:w-8 h-8 rounded-full relative mr-4">
            <div className="absolute mt-1 m-[10px]">5</div>
          </div>
          <div className="my-auto">
            If eligible, your donation will be matched.
          </div>
        </div>
        <PassportButtons />
      </div>
    );
  }

  function PassportButtons() {
    return (
      <>
        <div className="flex justify-center flex-col text-center mt-11">
          <div className="flex justify-center gap-5 mb-4">
            <p className="text-gitcoin-grey-500 text-3xl mt-auto">
              {passportState === PassportState.LOADING && (
                <span>
                  <PassportLogo
                    data-testid="passport-fetching-icon"
                    className="animate-spin w-10 opacity-80 mb-1"
                  />
                </span>
              )}
              {(passportState === PassportState.MATCH_ELIGIBLE ||
                passportState === PassportState.MATCH_INELIGIBLE) && (
                <>
                  <span data-testid="passport-score">
                    {(passport?.evidence?.rawScore &&
                      Number(passport?.evidence?.rawScore).toFixed(2)) ||
                      0}
                  </span>
                  <span className="mx-1">/</span>
                  <span data-testid="threshold">
                    {(passport?.evidence?.threshold &&
                      Number(passport?.evidence?.threshold).toFixed(2)) ||
                      0}
                  </span>
                </>
              )}
            </p>

            <Button
              type="button"
              $variant="outline"
              onClick={updatePassportScore}
              // disabled={passportState === PassportState.LOADING}
              className="flex gap-2 items-center justify-center shadow-sm text-sm rounded border-1 bg-violet-100 text-violet-400 px-5 py-2"
              data-testid="recalculate-score-button"
            >
              <ArrowPathIcon className="h-4 w-4" />
              {passportState === PassportState.INVALID_PASSPORT
                ? "Submit Score"
                : "Update Score"}
            </Button>
          </div>

          {passportState === PassportState.LOADING && (
            <div>
              <p className="text-grey-500 mb-2">Checking eligibility</p>
              <p>Fetching score from passport!</p>
            </div>
          )}

          {passportState === PassportState.MATCH_ELIGIBLE && (
            <div>
              <p className="text-teal-500 mb-2">Eligible for matching</p>
              <p>You are eligible for matching. Happy donating!</p>
            </div>
          )}

          {passportState === PassportState.MATCH_INELIGIBLE && (
            <div>
              <p className="text-pink-400 mb-2">Ineligible for matching</p>
              <p>
                Current score. Reach {passport?.evidence?.threshold || 0} to
                have your donation matched.
              </p>
            </div>
          )}

          {passportState === PassportState.NOT_CONNECTED && (
            <div>
              <p className="text-pink-400 mb-2">Ineligible for matching</p>
              <p>Please connect to Passport in order continue.</p>
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center mt-8">
          <Button
            type="button"
            $variant="outline"
            onClick={() => navigate(`/round/${chainId}/${roundId}`)}
            className="items-center justify-center shadow-sm text-sm rounded border px-10"
            data-testid="back-to-browsing-button"
          >
            Back to browsing
          </Button>

          <Button
            type="button"
            $variant="outline"
            onClick={() =>
              window.open(`https://passport.gitcoin.co/#/dashboard`, "_blank")
            }
            className="items-center justify-center shadow-sm text-sm rounded border-1 bg-grey-500 text-white px-10"
            data-testid="create-passport-button"
          >
            Create a Passport
          </Button>
        </div>

        <p className="mt-3 pb-3 text-center">
          <a
            data-testid="need-help-link"
            className="text-md border-b border-black pb-1"
            target="_blank"
            href="https://support.gitcoin.co/gitcoin-knowledge-base/gitcoin-passport/how-do-i-create-a-gitcoin-passport"
            rel="noreferrer"
          >
            Need Help?
          </a>
        </p>
      </>
    );
  }

  return (
    <>
      <Navbar roundUrlPath={`/round/${chainId}/${roundId}`} />
      <div className="lg:mx-20 px-4 py-7 h-screen">
        <header>
          <div
            data-testid="breadcrumb"
            className="text-grey-400 font-normal text-sm flex flex-row items-center gap-3"
          >
            <Link to={`/round/${chainId}/${roundId}`}>
              <span>Home</span>
            </Link>
            <ChevronRightIcon className="h-4 w-4" />
            <span>Connect to Passport</span>
          </div>
        </header>

        <main>
          <div className="text-center my-8">
            <h2 className="pt-8 pb-8 font-['Libre_Franklin']">
              <span className="font-semibold mr-2">Amplify</span>
              your donation
            </h2>
            <p className="text-xl mb-1">
              Unlock matching for your donation by verifying your identity
            </p>
            <p className="text-xl mb-1">
              Connect your wallet to Passport to check your identity score and
              maximize your donation power.
            </p>
            <p className="text-xl">
              Passport is designed to proactively verify users’ identities to
              protect against Sybil attacks.
            </p>

            <p className="mt-4 mb-10 pb-3">
              <a
                data-testid="what-is-passport-link"
                className="text-md border-b border-black pb-1"
                target="_blank"
                rel="noreferrer"
                href="https://support.gitcoin.co/gitcoin-knowledge-base/gitcoin-passport/common-questions"
              >
                What is Passport and how does it work?
              </a>
            </p>

            <div className="md:mx-6 md:px-10 lg:mx-30 lg:px-20">
              <HaveAPassportInstructions />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
