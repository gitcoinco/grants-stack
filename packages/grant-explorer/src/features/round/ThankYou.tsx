import { useEffect, useMemo, useState } from "react";
import { datadogLogs } from "@datadog/browser-logs";
import Footer from "common/src/components/Footer";
import bgImage from "../../assets/mint-your-impact-background.svg";
import Navbar from "../common/Navbar";
import { useCartStorage } from "../../store";
import { useCheckoutStore } from "../../checkoutStore";
import { ProgressStatus } from "../api/types";
import { useRoundById } from "../../context/RoundContext";
import { useWindowSize } from "react-use";
import { ThankYouSectionButtons } from "../common/ShareButtons";
import {
  ImpactMintingSuccess,
  PreviewFrame,
} from "../attestations/MintYourImpactComponents";
import { MintProgressModalBodyThankYou } from "../attestations/MintProgressModalBody"; // We'll define this next
import { useGetAttestationData } from "../../hooks/attestations/useGetAttestationData";
import { useEASAttestation } from "../../hooks/attestations/useEASAttestation";
import { useAccount, useBalance } from "wagmi";
import { useEstimateGas } from "../../hooks/attestations/useEstimateGas";
import { AttestationChainId } from "../attestations/utils/constants";
import { useAttestationFee } from "../contributors/hooks/useMintingAttestations";
import { useAttestationStore } from "../../attestationStore";
import { RainbowBorderButton } from "../contributors/components/Buttons/RainbowBorderButton";
import Modal from "../common/components/Modal";

export default function ThankYou() {
  datadogLogs.logger.info(
    "====> Route: /round/:chainId/:roundId/:txHash/thankyou"
  );
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const [minted, setMinted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("0");
  const [impactImageCid, setImpactImageCid] = useState<string | undefined>();
  const [attestationLink, setAttestationLink] = useState<string | undefined>();

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
    if (!minted) {
      window.scrollTo(0, 100);
    }
  }, [minted]);

  const transactions = useAttestationStore((state) =>
    state.getCheckedOutTransactions(address)
  );

  const handleSelectBackground = (option: string) => {
    setSelectedColor(option);
  };

  const toggleModal = async () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleSetMinted = () => {
    setMinted(true);
    setIsModalOpen(false);
    attestationStore.cleanCheckedOutTransactions();
  };

  const { width } = useWindowSize();

  const flex = width <= 1280;

  const { data, isLoading } = useGetAttestationData(
    transactions,
    !isModalOpen,
    selectedColor
  );

  useEffect(() => {
    if (data?.impactImageCid) {
      setImpactImageCid(data.impactImageCid);
    }
  }, [data]);

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

  const onViewTransaction = () => {
    window.open(attestationLink, "_blank");
  };

  const { data: balance, isLoading: isLoadingBalance } = useBalance({
    chainId: AttestationChainId,
    address,
  });
  const notEnoughFunds =
    isLoadingBalance || balance?.value === undefined
      ? false
      : balance.value < attestationFee + (gasEstimation ?? 0n);

  return (
    <>
      <Navbar />
      <div
        className="flex flex-col min-h-screen relative bg-bottom bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <main className="flex-grow flex items-center justify-center">
          {transactions.length > 0 && !minted ? (
            <div className="flex flex-col  lg:flex-row items-center justify-center w-full text-center">
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
              <div className="w-full lg:w-1/2  ">
                <div className="flex flex-col items-center justify-center">
                  {/* Main content */}
                  <div className="w-full max-w-[800px] min-h-svh overflow-hidden bg-gradient-to-b from-[#EBEBEB] to-transparent rounded-t-[400px] flex flex-col items-center justify-center pt-20 px-4 mx-auto">
                    <div className="flex flex-col items-center">
                      <div className="relative max-w-[500px] z-10 text-center">
                        <h1 className="text-5xl mb-2 font-modern-era-bold">
                          Mint your Impact
                        </h1>
                        <p className="mt-1 text-lg  font-modern-era-regular">
                          Capture your contribution onchain with an attestation
                          and receive a unique visual that symbolizes your
                          donation.
                        </p>
                        <p className="my-2 text-lg font-modern-era-regular">
                          This visual reflects your onchain attestation, marking
                          your support in a meaningful way.
                        </p>
                      </div>
                      <PreviewFrame
                        handleSelectBackground={handleSelectBackground}
                        mint={toggleModal}
                      />
                    </div>
                  </div>
                </div>
                <div className="fixed -bottom-6 right-11 w-full z-20">
                  <Footer />
                </div>
              </div>
            </div>
          ) : minted ? (
            <div className="rounded-xl absolute top-20 flex flex-col items-center text-center gap-6 px-[64px] py-8 backdrop-blur-xl">
              <div className="flex flex-col gap-2">
                <div className="relative text-center font-modern-era-medium text-[48px]/[52px]">
                  Your donation impact
                </div>
                <div className="relative text-[16px]/[26px] max-w-[500px] font-modern-era-regular">
                  Congratulations! Your attestation is now onchain, and here's
                  the unique visual that represents your donation. Share your
                  impact with your community and inspire others to join in!
                </div>
              </div>
              <ImpactMintingSuccess
                impactImageCid={impactImageCid}
                imageSize="size-[520px]"
                attestationLink={attestationLink ?? ""}
              />
              <div className="flex flex-wrap gap-6 my-2 z-50">
                <RainbowBorderButton
                  dataTestId="view-transaction-button"
                  onClick={onViewTransaction}
                >
                  View attestation
                </RainbowBorderButton>
                <button
                  className="blue-background-button font-medium font-mono"
                  onClick={() => {
                    window.open("https://explorer.gitcoin.co/", "_blank");
                  }}
                >
                  Return to Explorer
                </button>
              </div>
            </div>
          ) : (
            <div className={`w-full h-full flex flex-col items-center`}>
              <ThankYouSectionButtons
                roundName={round?.roundMetadata?.name ?? ""}
                isMrc={isMrc}
              />
              <div className="fixed -bottom-6 right-11 w-full z-20">
                <Footer />
              </div>
            </div>
          )}
        </main>

        {/* Progress Modal */}
        {transactions.length > 0 && (
          <>
            <Modal isOpen={isModalOpen} onClose={toggleModal} padding="p-0">
              <MintProgressModalBodyThankYou
                attestationFee={attestationFee}
                handleSwitchChain={handleSwitchChain}
                status={status}
                gasEstimation={gasEstimation}
                isLoadingEstimation={loadingGasEstimate}
                notEnoughFunds={notEnoughFunds}
                handleAttest={attest}
                impactImageCid={data?.impactImageCid}
                isLoading={isLoading || isRefetchingEstimate}
                heading="Mint your impact"
                subheading="Your attestation will be generated after you mint."
              />
            </Modal>
          </>
        )}
      </div>
    </>
  );
}
