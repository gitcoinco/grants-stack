import { datadogLogs } from "@datadog/browser-logs";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../common/Navbar";
import { Button } from "../common/styles";
import Footer from "../common/Footer";
import { Tab } from "@headlessui/react";
import { ChevronRightIcon } from "@heroicons/react/24/solid";


export default function PassportConnect() {
  datadogLogs.logger.info("====> Route: /round/:chainId/:roundId/passport/connect");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const { chainId, roundId } = useParams();

  const navigate = useNavigate();

  const tabStyles = (selected: boolean) =>
  selected
    ? "border-violet-500 border-b whitespace-nowrap py-4 px-1 text-sm outline-none"
    : "border-transparent text-grey-400 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 font-medium text-sm";


  function HaveAPassportInstructions() {
    return (
      <div data-testid="have-a-passport-instructions" className="text-left mt-8 mb-5 text-grey-500">
        <p className="text-[18px] mb-5 flex">
          <div className="bg-violet-200 w-8 h-8 rounded-full relative mr-4">
            <div className="absolute mt-1 ml-3">1</div>
          </div>
          <div className="my-auto">Connect your wallet to Passport.</div>
        </p>
        <p className="text-[18px] mb-5 flex">
          <div className="bg-violet-200 w-8 h-8 rounded-full relative mr-4">
            <div className="absolute mt-1 m-[10px]">2</div>
          </div>
          <div className="my-auto">Your eligibility score will be calculated.</div>
        </p>
        <p className="text-[18px] mb-5 flex">
          <div className="bg-violet-200 w-8 h-8 rounded-full relative mr-4">
            <div className="absolute mt-1 m-[10px]">3</div>
          </div>
          <div className="my-auto">
            If ineligible, you will have the chance to verify more stamps to raise your score.
            Once you have, recalculate your score.
          </div>
        </p>
        <p className="text-[18px] mb-5 flex">
          <div className="bg-violet-200 w-8 h-8 rounded-full relative mr-4">
            <div className="absolute mt-1 m-[10px]">4</div>
          </div>
          <div className="my-auto">If eligible, your donation will be matched.</div>
        </p>

        <PassportButtons hasPassport={true}/>

      </div>
    )
  }

  function DontHaveAPassportInstructions() {
    return(
      <div data-testid="no-passport-instructions" className="text-left my-8 text-grey-500">
        <p className="text-[18px] mb-5 flex">
          <div className="bg-violet-200 w-8 h-8 rounded-full relative mr-4">
            <div className="absolute mt-1 ml-3">1</div>
          </div>
          <div className="my-auto">
            Connect your wallet to Passport. You will be taken to a new window to begin verifying your identity.
          </div>
        </p>
        <p className="text-[18px] mb-5 flex">
          <div className="bg-violet-200 w-8 h-8 rounded-full relative mr-4">
            <div className="absolute mt-1 m-[10px]">2</div>
          </div>
          <div className="my-auto">Verify your identity by connecting to various stamps.</div>
        </p>
        <p className="text-[18px] mb-5 flex">
          <div className="bg-violet-200 w-8 h-8 rounded-full relative mr-4">
            <div className="absolute mt-1 m-[10px]">3</div>
          </div>
          <div className="my-auto">
            Return back to this screen and recalculate your score.
          </div>
        </p>
        <p className="text-[18px] mb-5 flex">
          <div className="bg-violet-200 w-8 h-8 rounded-full relative mr-4">
            <div className="absolute mt-1 m-[10px]">4</div>
          </div>
          <div className="my-auto">
          If ineligible, you will have the chance to verify more stamps to raise your score. Once you have, recalculate your score.
          </div>
        </p>
        <p className="text-[18px] mb-5 flex">
          <div className="bg-violet-200 w-8 h-8 rounded-full relative mr-4">
            <div className="absolute mt-1 m-[10px]">5</div>
          </div>
          <div className="my-auto">
            If eligible, your donation will be matched.
          </div>
        </p>

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
            <HaveAPassportInstructions />
          </Tab.Panel>
          <Tab.Panel>
            <DontHaveAPassportInstructions />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    )
  }

  function PassportButtons(props: { hasPassport: boolean }) {
    return (
      <>
        <div className="flex justify-center">
          <p>TODO: ADD Passport score and status</p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button
            type="button"
            $variant="outline"
            onClick={() => console.log('TODO: ADD recalculate score')}
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
      <Navbar roundUrlPath={`/round/${chainId}/${roundId}`} />
      <div className="lg:mx-20 px-4 py-7 h-screen">

        <header>
          <div data-testid="breadcrumb" className="text-grey-400 font-normal text-sm flex flex-row items-center gap-3">
            <Link to={`/round/${chainId}/${roundId}`}>
              <span>Home</span>
            </Link>
            <ChevronRightIcon className="h-4 w-4" />
            <span>Connect to Passport</span>
          </div>
        </header>

        <main>
          <div className="text-center my-8">
            <h2 className="pt-8 pb-8">
              <span className="font-semibold mr-2">Amplify</span>
              your donation
            </h2>
            <p className="text-xl mb-1">Unlock matching for your donation by verifying your identity</p>
            <p className="text-xl">Connect your wallet to Passport to check your identity score and maximize your donation power.</p>

            <p className="mt-4 mb-10">
              {/* TODO: Add URL */}
              <a className="text-md border-b border-black pb-1" target="_blank" href="#">How does Passport scoring work?</a>
            </p>

            <div className="mx-6 px-10">
              <ConnectPassportInstructions />
            </div>

          </div>
        </main>
        <Footer />
      </div>
    </>
  );

}