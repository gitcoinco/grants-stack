import { datadogLogs } from "@datadog/browser-logs";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../common/Navbar";
import { Button } from "../common/styles";
import Footer from "../common/Footer";
import { Tab } from "@headlessui/react";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { fetchPassport, PassportResponse, PassportState, submitPassport } from "../api/passport";
import { ReactComponent as PassportLogo } from "../../assets/passport-logo.svg";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

export default function PassportConnect() {
  datadogLogs.logger.info("====> Route: /round/:chainId/:roundId/passport/connect");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const navigate = useNavigate();

  const { chainId, roundId } = useParams();

  const PASSPORT_COMMUNITY_ID = process.env.REACT_APP_PASSPORT_API_COMMUNITY_ID;   // TODO: fetch from round metadata
  const PASSPORT_THRESHOLD = 0; // TODO: fetch from scorer API

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
    if (res.ok) {
      const json = await res.json();
      setPassport(json);
      setPassportState(
        json.score >= PASSPORT_THRESHOLD
          ? PassportState.MATCH_ELIGIBLE
          : PassportState.MATCH_INELIGIBLE
      );
    } else {
      setError(res);
      switch (res.status) {
        case 400: // unregistered/nonexistent passport address
          setPassportState(PassportState.INVALID_PASSPORT);
          console.error("unregistered/nonexistent passport address", res.json());
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
  }

  useEffect(() => {
    setPassportState(PassportState.LOADING);
    if (isConnected) {
      callFetchPassport();
    } else {
      setPassportState(PassportState.NOT_CONNECTED);
    }
  }, [address, isConnected]); // eslint-disable-line react-hooks/exhaustive-deps


  const triggerSubmitPassport = async () => {
    if (!address || !PASSPORT_COMMUNITY_ID) return;

    setPassportState(PassportState.LOADING);
    submitPassport(address, PASSPORT_COMMUNITY_ID).then(() => {
      callFetchPassport();
    }).catch(err => {
      console.error("Error submitting passport", err);
      setPassportState(PassportState.ERROR);
    })
  };

  const tabStyles = (selected: boolean) =>
    selected
      ? "border-violet-500 border-b whitespace-nowrap py-4 px-1 text-sm outline-none"
      : "border-transparent text-grey-400 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 font-medium text-sm";

  function HaveAPassportInstructions() {
    return (
      <div data-testid="have-a-passport-instructions" className="text-left mt-8 mb-5 text-grey-500">
        <div className="text-[18px] mb-5 flex">
          <div className="bg-violet-200 w-8 h-8 rounded-full relative mr-4">
            <div className="absolute mt-1 ml-3">1</div>
          </div>
          <div className="my-auto">Connect your wallet to Passport.</div>
        </div>
        <div className="text-[18px] mb-5 flex">
          <div className="bg-violet-200 w-8 h-8 rounded-full relative mr-4">
            <div className="absolute mt-1 m-[10px]">2</div>
          </div>
          <div className="my-auto">Your eligibility score will be calculated.</div>
        </div>
        <div className="text-[18px] mb-5 flex">
          <div className="bg-violet-200 w-24 md:w-8 h-8 rounded-full relative mr-4">
            <div className="absolute mt-1 m-[10px]">3</div>
          </div>
          <div className="my-auto">
            If ineligible, you will have the chance to verify more stamps to raise your score.
            Once you have, recalculate your score.
          </div>
        </div>
        <div className="text-[18px] mb-5 flex">
          <div className="bg-violet-200 w-8 h-8 rounded-full relative mr-4">
            <div className="absolute mt-1 m-[10px]">4</div>
          </div>
          <div className="my-auto">If eligible, your donation will be matched.</div>
        </div>

        <PassportButtons hasPassport={true}/>

      </div>
    )
  }

  function DontHaveAPassportInstructions() {
    return (
      <div data-testid="no-passport-instructions" className="text-left my-8 text-grey-500">
        <div className="text-[18px] mb-5 flex">
          <div className="bg-violet-200 w-[90px] md:w-8 h-8 rounded-full relative mr-4">
            <div className="absolute mt-1 ml-3">1</div>
          </div>
          <div className="my-auto">
            Connect your wallet to Passport. You will be taken to a new window to begin verifying your identity.
          </div>
        </div>
        <div className="text-[18px] mb-5 flex">
          <div className="bg-violet-200 w-[48px] md:w-8 h-8 rounded-full relative mr-4">
            <div className="absolute mt-1 m-[10px]">2</div>
          </div>
          <div className="my-auto">Verify your identity by connecting to various stamps.</div>
        </div>
        <div className="text-[18px] mb-5 flex">
          <div className="bg-violet-200 w-[48px] md:w-8 h-8 rounded-full relative mr-4">
            <div className="absolute mt-1 m-[10px]">3</div>
          </div>
          <div className="my-auto">
            Return back to this screen and recalculate your score.
          </div>
        </div>
        <div className="text-[18px] mb-5 flex">
          <div className="bg-violet-200 w-24 md:w-8 h-8 rounded-full relative mr-4">
            <div className="absolute mt-1 m-[10px]">4</div>
          </div>
          <div className="my-auto">
            If ineligible, you will have the chance to verify more stamps to raise your score. Once you have,
            recalculate your score.
          </div>
        </div>
        <div className="text-[18px] mb-5 flex">
          <div className="bg-violet-200 w-8 h-8 rounded-full relative mr-4">
            <div className="absolute mt-1 m-[10px]">5</div>
          </div>
          <div className="my-auto">
            If eligible, your donation will be matched.
          </div>
        </div>

        <PassportButtons hasPassport={false}/>
      </div>
    )
  }

  function ConnectPassportInstructions() {
    return (
      <Tab.Group>
        <div className="justify-end grow relative">
          <Tab.List className="border-b my-6 flex items-center justify-between">
            <div className="space-x-8">
              <Tab data-testid="have-a-passport-tab" className={({ selected }) => tabStyles(selected)}>
                {({ selected }) => (
                  <div className={selected ? "text-violet-500" : ""}>
                    Have a Passport?
                  </div>
                )}
              </Tab>
              <Tab data-testid="no-passport-tab" className={({ selected }) => tabStyles(selected)}>
                {({ selected }) => (
                  <div className={selected ? "text-violet-500" : ""}>
                    Don't have a Passport?
                  </div>
                )}
              </Tab>
            </div>
          </Tab.List>
        </div>
        <Tab.Panels>
          <Tab.Panel>
            <HaveAPassportInstructions/>
          </Tab.Panel>
          <Tab.Panel>
            <DontHaveAPassportInstructions/>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    )
  }

  function PassportButtons(props: { hasPassport: boolean }) {

    return (
      <>
        <div className="flex justify-center flex-col text-center mt-11">

          <p className="text-gitcoin-grey-500 text-3xl mb-2 mx-auto">
            {
              passportState === PassportState.LOADING ?
                <span><PassportLogo data-testid="passport-fetching-icon" className="animate-spin w-10"/></span>
                : <>
                  <span data-testid="passport-score">{passport?.score && Number(passport?.score).toFixed(2) || 0}</span>
                  <span className="mx-1">/</span>
                  <span data-testid="threshold">{PASSPORT_THRESHOLD || 0}</span>
                </>
            }
          </p>

          {passportState === PassportState.LOADING &&
            <div>
              <p className="text-grey-500 mb-2">Checking eligibility</p>
              <p>Fetch score from passport!</p>
            </div>
          }

          {passportState === PassportState.MATCH_ELIGIBLE &&
            <div>
              <p className="text-teal-500 mb-2">Eligible for matching</p>
              <p>You are eligible for matching. Happy donating!</p>
            </div>
          }

          {passportState === PassportState.MATCH_INELIGIBLE &&
            <div>
              <p className="text-pink-400 mb-2">Ineligible for matching</p>
              <p>Current score. Reach {PASSPORT_THRESHOLD} to have your donation matched.</p>
            </div>
          }

          {passportState === PassportState.NOT_CONNECTED &&
            <div>
              <p className="text-pink-400 mb-2">Ineligible for matching</p>
              <p>Please connect to Passport in order continue.</p>
            </div>
          }

        </div>

        <div className="flex gap-4 justify-center">
          <Button
            type="button"
            $variant="outline"
            onClick={triggerSubmitPassport}
            className="my-8 items-center justify-center shadow-sm text-sm rounded border-1 bg-violet-100 text-violet-400 px-10"
            data-testid="recalculate-score"
          >
            Recalculate Score
          </Button>

          <Button
            type="button"
            $variant="outline"
            onClick={() => window.open(`https://passport.gitcoin.co/#/dashboard`, '_blank')}
            className="my-8 items-center justify-center shadow-sm text-sm rounded border-1 bg-grey-500 text-white px-10"
            data-testid="open-passport"
          >
            {props.hasPassport ? "Open Passport" : "Create Passport"}
          </Button>
        </div>
        <div>
          <div className="flex justify-center">
            <Button
              type="button"
              $variant="outline"
              onClick={() => navigate(`/round/${chainId}/${roundId}`)}
              className="mb-8 items-center justify-center shadow-sm text-sm rounded border px-10"
              data-testid="back-to-browsing-button"
            >
              Back to browsing
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar roundUrlPath={`/round/${chainId}/${roundId}`}/>
      <div className="lg:mx-20 px-4 py-7 h-screen">

        <header>
          <div data-testid="breadcrumb" className="text-grey-400 font-normal text-sm flex flex-row items-center gap-3">
            <Link to={`/round/${chainId}/${roundId}`}>
              <span>Home</span>
            </Link>
            <ChevronRightIcon className="h-4 w-4"/>
            <span>Connect to Passport</span>
          </div>
        </header>

        <main>
          <div className="text-center my-8">
            <h2 className="pt-8 pb-8 font-['Libre_Franklin']">
              <span className="font-semibold mr-2">Amplify</span>
              your donation
            </h2>
            <p className="text-xl mb-1">Unlock matching for your donation by verifying your identity</p>
            <p className="text-xl">Connect your wallet to Passport to check your identity score and maximize your
              donation power.</p>

            <p className="mt-4 mb-10">
              {/* TODO: Add URL */}
              <a className="text-md border-b border-black pb-1" target="_blank" href="#">How does Passport scoring
                work?</a>
            </p>

            <div className="md:mx-6 md:px-10 lg:mx-30 lg:px-20">
              <ConnectPassportInstructions/>
            </div>

          </div>
        </main>
        <Footer/>
      </div>
    </>
  );

}
