import { useEffect, useMemo, useState } from "react";
import { datadogLogs } from "@datadog/browser-logs";
import Footer from "common/src/components/Footer";
import bgImage from "../../assets/mint-your-impact-background.svg";
import Navbar from "../common/Navbar";
import { useCartStorage } from "../../store";
import { useCheckoutStore } from "../../checkoutStore";
import { ProgressStatus } from "../api/types";
import { useRoundById } from "../../context/RoundContext";
import image from "../../assets/gitcoinlogo-black.svg";
import alt1 from "../../assets/alt1.svg";
import { useWindowSize } from "react-use";
import html2canvas from "html2canvas-pro";
import { ShareButtons, ThankYouSectionButtons } from "../common/ShareButtons";
import {
  AttestationFrame,
  PreviewFrame,
} from "../common/MintYourImpactComponents";
import MintAttestationProgressModal from "../common/MintAttestationProgressModal"; // Adjust the import path as needed
import { MintProgressModalBody } from "./MintProgressModalBody"; // We'll define this next

export default function ThankYou() {
  datadogLogs.logger.info(
    "====> Route: /round/:chainId/:roundId/:txHash/thankyou"
  );
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const cart = useCartStorage();
  const checkoutStore = useCheckoutStore();

  /** Remove checked out projects from cart, but keep the ones we didn't yet check out succesfully. */
  const checkedOutChains = useMemo(
    () =>
      Object.keys(checkoutStore.voteStatus)
        .filter(
          (key) =>
            checkoutStore.voteStatus[Number(key)] === ProgressStatus.IS_SUCCESS
        )
        .map(Number),
    [checkoutStore]
  );

  /** Cleanup */
  useEffect(() => {
    cart.projects
      .filter((proj) => checkedOutChains.includes(proj.chainId))
      .forEach((proj) => {
        cart.remove(proj);
      });

    checkoutStore.setChainsToCheckout([]);

    checkedOutChains.forEach((chain) => {
      checkoutStore.setVoteStatusForChain(chain, ProgressStatus.NOT_STARTED);
      checkoutStore.setPermitStatusForChain(chain, ProgressStatus.NOT_STARTED);
      checkoutStore.setChainSwitchStatusForChain(
        chain,
        ProgressStatus.NOT_STARTED
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.scrollTo(0, 100);
  }, []);

  /** Fetch round data for tweet */
  const checkedOutProjects = useCheckoutStore((state) =>
    state.getCheckedOutProjects()
  );

  const isMrc =
    new Set(checkedOutProjects.map((project) => project.chainId)).size > 1;
  const topProject = checkedOutProjects
    .sort((a, b) =>
      Number(a.amount) > Number(b.amount)
        ? -1
        : Number(a.amount) < Number(b.amount)
          ? 1
          : 0
    )
    .at(0);

  const { round } = useRoundById(
    /* If we don't have a round, pass in invalid params and silently fail */
    Number(topProject?.chainId),
    topProject?.roundId ?? ""
  );

  const [minted, setMinted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState(alt1);

  const handleSelectBackground = (background: string) => {
    setSelectedBackground(background);
  };

  const mint = async () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleToggleModal = () => {
    setMinted(true);
    setIsModalOpen(false);
  };

  const { width } = useWindowSize();

  const flex = width <= 1280;

  const handleGetAttestationPreview = async () => {
    const element = document.getElementById("attestation-impact-frame");
    if (element) {
      const canvas = await html2canvas(element);
      const data = canvas.toDataURL("image/png");
      console.log(data);
      return data;
    }
  };

  // Mock data TODO: replace with real data Store the last
  // attestation data based on the last created checkout transactions
  const projectsData = [
    {
      rank: 1,
      name: "Saving forests around the world",
      round: "Climate Round",
      image: image,
    },
    {
      rank: 2,
      name: "Funding schools in Mexico",
      round: "Education Round",
      image: image,
    },
    {
      rank: 3,
      name: "Accessible software for everyone",
      round: "OSS Round",
      image: image,
    },
  ];

  return (
    <>
      <Navbar />
      <div
        className="flex flex-col min-h-screen relative bg-bottom bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <main className="flex-grow flex items-center justify-center">
          {!minted ? (
            <div className="flex flex-col xl:flex-row items-center justify-center w-full text-center">
              {/* Left Section */}
              <div
                className={`w-full my-[5%] ${flex && "mt-[14%] "}  lg:w-1/2 flex flex-col items-center`}
              >
                <ThankYouSectionButtons
                  roundName={round?.roundMetadata?.name ?? ""}
                  isMrc={isMrc}
                />
              </div>

              {/* Right Section */}
              <div className="w-full my-[5%] lg:w-1/2  ">
                <div className="flex flex-col items-center justify-center">
                  {/* Main content */}
                  <div className="w-full max-w-[800px] min-h-svh overflow-hidden bg-gradient-to-b from-[#EBEBEB] to-transparent rounded-t-[400px] flex flex-col items-center justify-center pt-20 px-4 mx-auto">
                    <div className="flex flex-col items-center">
                      <div className="relative z-10 text-center">
                        <h1 className="text-5xl mb-2 font-modern-era-bold">
                          Mint your Impact
                        </h1>
                        <p className="mt-1 text-lg font-modern-era-regular">
                          Create a unique onchain collectible that
                        </p>
                        <p className="mb-2 text-lg font-modern-era-regular">
                          shows off your donations from this round!
                        </p>
                      </div>
                      <PreviewFrame
                        handleSelectBackground={handleSelectBackground}
                        mint={mint}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center max-w-screen-2xl text-center">
              <div className="inline-flex flex-col items-center justify-center gap-6 px-16 pt-8 relative bg-[#ffffff66] rounded-3xl">
                <div className="flex flex-col items-start  relative self-stretch w-full ">
                  <div className="w-full my-[5%]  flex flex-col items-center text-left">
                    <div className="flex flex-col items-start  relative self-stretch w-full ">
                      <div className="relative w-fit font-modern-era-medium text-[48px] ">
                        Your donation impact
                      </div>
                      <div className="relative self-stretch text-[26px] font-modern-era-regular mb-3">
                        Share with your friends!
                      </div>
                    </div>
                    <AttestationFrame
                      selectedBackground={selectedBackground}
                      projects={projectsData}
                      checkedOutChains={6}
                      projectsFunded={20}
                      roundsSupported={5}
                      topRound={"OSS Round"}
                    />
                  </div>
                </div>
              </div>
              <ShareButtons />
            </div>
          )}
        </main>
        <div className="fixed -bottom-6 right-11 w-full z-20">
          <Footer />
        </div>

        {/* Progress Modal */}
        <MintAttestationProgressModal
          isOpen={isModalOpen}
          onClose={mint}
          heading="Mint your impact"
          subheading="Your unique donation graphic will be generated after you mint."
          body={
            <MintProgressModalBody
              handleToggleModal={handleToggleModal}
              handleGetAttestationPreview={handleGetAttestationPreview}
            />
          }
        />
      </div>
      <div
        id="hidden-attestation-frame"
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "0",
          height: "0",
          overflow: "hidden",
        }}
      >
        <AttestationFrame
          selectedBackground={selectedBackground}
          projects={projectsData}
          checkedOutChains={6}
          projectsFunded={20}
          roundsSupported={5}
          topRound={"OSS Round"}
        />
      </div>
    </>
  );
}
