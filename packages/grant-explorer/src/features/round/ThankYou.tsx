import { useEffect, useMemo, useState } from "react";
import { datadogLogs } from "@datadog/browser-logs";
import Footer from "common/src/components/Footer";
import bgImage from "../../assets/mint-your-impact-background.svg";
import Navbar from "../common/Navbar";
import { useCartStorage } from "../../store";
import { useCheckoutStore } from "../../checkoutStore";
import { ProgressStatus } from "../api/types";
import { useRoundById, useRoundNamesByIds } from "../../context/RoundContext";
import image from "../../assets/gitcoinlogo-black.svg";
import alt1 from "../../assets/alt1.svg";
import { useWindowSize } from "react-use";
import { ThankYouSectionButtons } from "../common/ShareButtons";
import {
  HiddenAttestationFrame,
  ImpactMintingSuccess,
  PreviewFrame,
} from "../attestations/MintYourImpactComponents";
import { getRoundsToFetchNames } from "../attestations/utils/getRoundsToFetchNames";
import MintAttestationProgressModal from "../attestations/MintAttestationProgressModal"; // Adjust the import path as needed
import { MintProgressModalBodyThankYou } from "../attestations/MintProgressModalBody"; // We'll define this next
import { useGetAttestationData } from "../../hooks/attestations/useGetAttestationData";
import { useEASAttestation } from "../../hooks/attestations/useEASAttestation";
import { handleGetAttestationPreview } from "../../hooks/attestations/utils/getAttestationPreview";
import { useResolveENS } from "../../hooks/useENS";
import { useAccount, useBalance } from "wagmi";
import { useGetImages } from "../../hooks/attestations/useGetImages";
import { useEstimateGas } from "../../hooks/attestations/useEstimateGas";
import { AttestationChainId } from "../attestations/utils/constants";
import { ethers } from "ethers";
import { useAttestationFee } from "../contributors/hooks/useMintingAttestations";
import { useAttestationStore } from "../../attestationStore";
import { useDebugMode } from "../api/utils";

export default function ThankYou() {
  datadogLogs.logger.info(
    "====> Route: /round/:chainId/:roundId/:txHash/thankyou"
  );
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const cart = useCartStorage();
  const checkoutStore = useCheckoutStore();
  const { address } = useAccount();
  const attestationStore = useAttestationStore();

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

  const transactions = useAttestationStore((state) =>
    state.getCheckedOutTransactions()
  );

  const ImpactFrameProps = useAttestationStore((state) => {
    return state.getFrameProps(transactions);
  });

  const roundsToFetchName = getRoundsToFetchNames(ImpactFrameProps);

  const { data: roundNames, isLoading: isLoadingRoundNames } =
    useRoundNamesByIds(roundsToFetchName);

  const [minted, setMinted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState(alt1);

  const handleSelectBackground = (background: string) => {
    setSelectedBackground(background);
  };

  const toggleModal = async () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleSetMinted = () => {
    setMinted(true);
    setIsModalOpen(false);
    attestationStore.cleanCheckedOutProjects();
  };

  const { width } = useWindowSize();

  const flex = width <= 1280;

  const { data: name, isLoading: isLoadingENS } = useResolveENS(address);

  const {
    data: imagesBase64,
    isLoading: isLoadingImages,
    isFetched: imagesFetched,
  } = useGetImages(
    ImpactFrameProps.projects.map((project) => project.image),
    isModalOpen
  );

  const { data, isLoading } = useGetAttestationData(
    transactions,
    handleGetAttestationPreview,
    isLoadingENS ||
      isLoadingImages ||
      !isModalOpen ||
      isLoadingRoundNames ||
      !imagesFetched,
    selectedBackground
  );

  const [impactImageCid, setImpactImageCid] = useState<string | undefined>();
  const [attestationLink, setAttestationLink] = useState<string | undefined>();

  useEffect(() => {
    if (data?.impactImageCid) {
      setImpactImageCid(data.impactImageCid);
    }
  }, [data]);

  const frameId = ethers.utils.solidityKeccak256(["string[]"], [transactions]);

  const {
    data: gasEstimation,
    isLoading: loadingGasEstimate,
    isRefetching: isRefetchingEstimate,
  } = useEstimateGas(AttestationChainId, !isLoading, data?.data);

  const { data: attestationFee } = useAttestationFee();

  const { handleAttest, handleSwitchChain, status } = useEASAttestation(
    AttestationChainId,
    handleSetMinted,
    data?.data,
    attestationFee
  );

  const attest = async () => {
    setAttestationLink(await handleAttest());
  };

  const { data: balance, isLoading: isLoadingBalance } = useBalance({
    chainId: AttestationChainId,
    address,
  });
  const notEnoughFunds =
    isLoadingBalance || balance?.value === undefined
      ? false
      : balance.value < attestationFee + (gasEstimation ?? 0n);

  const topRoundName = roundNames
    ? roundNames[ImpactFrameProps?.topRound?.chainId ?? 0][
        ImpactFrameProps?.topRound?.roundId ?? ""
      ]
    : "";

  const ImpactFramePropsWithNames = {
    ...ImpactFrameProps,
    topRoundName,
    projects: ImpactFrameProps.projects.map((project) => ({
      ...project,
      round: roundNames
        ? (roundNames[project?.chainId ?? 0][project?.roundId ?? ""] ??
          project.round)
        : project.round,
    })),
  };
  const debugModeEnabled = useDebugMode();

  return (
    <>
      <Navbar />
      <div
        className="flex flex-col min-h-screen relative bg-bottom bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <main className="flex-grow flex items-center justify-center">
          {transactions.length > 0 && !minted ? (
            <div className="flex flex-col-reverse md:flex-col xl:flex-row items-center justify-center w-full text-center">
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
              {debugModeEnabled &&
              <div className="w-full my-[5%] lg:w-1/2  ">
                <div className="flex flex-col items-center justify-center">
                  {/* Main content */}
                  <div className="w-full max-w-[800px] min-h-svh overflow-hidden bg-gradient-to-b from-[#EBEBEB] to-transparent rounded-t-[400px] flex flex-col items-center justify-center pt-20 px-4 mx-auto">
                    <div className="flex flex-col items-center">
                      <div className="relative z-10 text-center">
                        <h1 className="text-2xl md:text-5xl mb-2 font-modern-era-bold">
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
                        mint={toggleModal}
                      />
                    </div>
                  </div>
                </div>
              </div>
              }
            </div>
          ) : minted ? (
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
                    <ImpactMintingSuccess
                      impactImageCid={impactImageCid}
                      containerSize="w-[630px] h-[630px]"
                      imageSize="w-[600px] h-[600px]"
                      attestationLink={attestationLink ?? ""}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`w-full h-full flex flex-col items-center`}>
              <ThankYouSectionButtons
                roundName={round?.roundMetadata?.name ?? ""}
                isMrc={isMrc}
              />
            </div>
          )}
        </main>
        <div className="fixed -bottom-6 right-11 w-full z-20">
          <Footer />
        </div>

        {/* Progress Modal */}
        {transactions.length > 0 && (
          <>
            <MintAttestationProgressModal
              isOpen={isModalOpen}
              onClose={toggleModal}
              heading="Mint your impact"
              subheading="Your unique donation graphic will be generated after you mint."
              body={
                <MintProgressModalBodyThankYou
                  attestationFee={attestationFee}
                  handleSwitchChain={handleSwitchChain}
                  status={status}
                  gasEstimation={gasEstimation}
                  isLoadingEstimation={loadingGasEstimate}
                  notEnoughFunds={notEnoughFunds}
                  handleAttest={attest}
                  impactImageCid={data?.impactImageCid}
                  isLoading={isLoading || isLoadingENS || isRefetchingEstimate}
                />
              }
            />
            <HiddenAttestationFrame
              FrameProps={ImpactFramePropsWithNames}
              selectedBackground={selectedBackground}
              address={address}
              name={name}
              imagesBase64={imagesBase64 ?? [image, image, image]}
              frameId={frameId}
            />
          </>
        )}
      </div>
    </>
  );
}
