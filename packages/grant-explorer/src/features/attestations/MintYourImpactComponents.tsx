import React from "react";
import { Button } from "common/src/styles";
import { AttestationFrameProps } from "../api/types";
import useColorAndBackground from "../../hooks/attestations/useColorAndBackground";
import { ShareButtons } from "../common/ShareButtons";
import { useGetImages } from "../../hooks/attestations/useGetImages";

type Project = {
  rank: number;
  name: string;
  round: string;
  image: string;
};

export const AttestationFrame = ({
  selectedBackground,
  topRound,
  projectsFunded,
  roundsSupported,
  checkedOutChains,
  projects,
  address,
  ensName,
}: {
  selectedBackground: string;
  topRound: string;
  projectsFunded: number;
  roundsSupported: number;
  checkedOutChains: number;
  projects: Project[];
  address: string | undefined;
  ensName: string | undefined;
}) => {
  const { attestationFrameLogo } = useColorAndBackground();
  if (!address && !ensName) return null;
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative rounded-3xl overflow-hidden"
        id="attestation-impact-frame"
        style={{
          backgroundImage: `url(${selectedBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "600px",
          height: "600px",
        }}
      >
        <div className="flex flex-col w-full h-full p-6">
          {/* Header */}
          <div
            className="flex items-center justify-between p-5 border border-black rounded-t-lg bg-white bg-opacity-10"
            style={{ height: "70px", width: "100%" }}
          >
            <div
              className="flex items-center space-x-2"
              style={{ maxWidth: "80%" }}
            >
              {ensName ? (
                <div
                  className="font-mono font-medium text-black text-[19px] truncate"
                  style={{ maxWidth: "100%" }}
                >
                  {ensName}
                </div>
              ) : (
                <div
                  className="font-mono font-medium text-black text-sm truncate"
                  style={{ maxWidth: "100%" }}
                >
                  {address}
                </div>
              )}
            </div>
            <img
              className="h-6 w-auto"
              alt="Logo"
              src={attestationFrameLogo}
              style={{ flexShrink: 0 }}
            />
          </div>

          {/* Main Body */}
          <div
            className="flex flex-1 w-full bg-white bg-opacity-10 border-x border-b border-black rounded-b-lg overflow-x-auto"
            style={{
              scrollbarWidth: "none" /* Firefox */,
              msOverflowStyle: "none" /* Internet Explorer 10+ */,
            }}
          >
            {/* Left Section (Top Projects and Top Round) */}
            <div className="flex flex-col flex-1 h-full p-5 w-[350px]">
              {/* Top Projects Header */}
              <div className="w-full pb-4 border-b border-black">
                <h2 className="font-mono font-medium text-black text-[18px]">
                  Top Projects
                </h2>
              </div>

              {/* Project List (3/4 of the height) */}
              <div
                className="flex-[2] overflow-x-auto"
                style={{
                  scrollbarWidth: "none" /* Firefox */,
                  msOverflowStyle: "none" /* Internet Explorer 10+ */,
                }}
              >
                {projects.map((project, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 py-4 border-b border-black"
                  >
                    <div className="font-mono font-medium text-black text-[16px]">
                      {project.rank}
                    </div>
                    <img
                      className="w-8 h-8 rounded-full"
                      alt="Project"
                      src={project.image}
                    />
                    <div className="flex flex-col flex-1">
                      <p className="text-black text-[14px] font-medium truncate">
                        {project.name}
                      </p>
                      <p className="text-gray-600 text-[12px] break-words truncate">
                        {project.round}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Top Round Section (1/4 of the height) */}
              <div className="flex-[1] w-full mt-4 items-center justify-center">
                <div
                  className={`flex flex-col ${
                    projects.length < 3 && "border-t border-black py-4"
                  }`}
                >
                  <p className="text-black text-[18px] font-medium font-mono">
                    Top Round
                  </p>
                </div>
                <div className="flex flex-col flex-1 items-left text-left relative top-5">
                  <p className="text-black text-[25px] font-medium break-words leading-tight overflow-hidden">
                    {topRound}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section (Stats) */}
            <div className="flex flex-col w-[250px] my-2 p-5 border-l border-black">
              {[
                { value: projectsFunded, label: "Projects Funded" },
                { value: roundsSupported, label: "Rounds Supported" },
                { value: checkedOutChains, label: "Chains" },
              ].map((stat, index) => (
                <div key={index} className="flex flex-col py-5">
                  <div className="text-[48px] font-medium font-mono text-black">
                    {stat.value}
                  </div>
                  <div className="text-[16px] mt-3 font-medium font-mono text-black">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PreviewFrame = ({
  handleSelectBackground,
  mint,
}: {
  handleSelectBackground: (background: string) => void;
  mint: () => void;
}) => {
  const {
    backgroundAlternatives,
    defaultColor,
    backgroundMapper,
    colorMapper,
    preview_alt1,
  } = useColorAndBackground();

  const [selectedColor, setSelectedColor] = React.useState("0");
  const [previewBackground, setPreviewBackground] =
    React.useState(preview_alt1);

  function selectBackground(option: string) {
    setSelectedColor(option);
    setPreviewBackground(backgroundAlternatives[Number(option)]);
    handleSelectBackground(
      backgroundMapper[option as keyof typeof backgroundMapper]
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className="flex flex-col w-auto items-center relative rounded-3xl"
        style={{
          backgroundImage: `url(${previewBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "400px",
          height: "400px",
        }}
      ></div>
      <div className="flex flex-wrap gap-3 items-center mt-3   p-2">
        <div className="flex flex-col items-center">
          <div className="flex flex-wrap items-center space-x-2 z-30">
            <div className="text-2xl font-modern-era-regular">
              Pick your color
            </div>

            {Object.keys(colorMapper).map((key, index) => (
              <div
                key={index}
                onClick={() => selectBackground(key)}
                className={`w-5 h-5 rounded-full cursor-pointer ${
                  selectedColor === key ? "border-1 border-black" : ""
                }`}
                style={{
                  backgroundColor:
                    selectedColor === key
                      ? colorMapper[key as unknown as keyof typeof colorMapper]
                      : defaultColor,
                }}
              />
            ))}
          </div>
          <div className="mt-2 z-40">
            <div
              className={`flex align-center justify-center border-[1px] rounded-[8px] bg-rainbow-gradient border-transparent`}
            >
              <Button
                type="button"
                className={`px-10 py-1 rounded-[8px] bg-white font-medium font-mono text-base text-black h-8 whitespace-nowrap border-[2px] border-transparent hover:shadow-md`}
                onClick={mint}
                data-testid="mint-donation-button"
              >
                Mint donation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PreviewFrameHistoryPage = ({
  nextStep,
  selectBackground,
  previewBackground,
  selectedColor,
}: {
  selectBackground: (background: string) => void;
  nextStep: () => void;
  previewBackground: string;
  selectedColor: string;
}) => {
  const { defaultColor, colorMapper } = useColorAndBackground();

  return (
    <div className="flex flex-col items-center">
      <div
        className="flex flex-col w-auto items-center relative rounded-3xl"
        style={{
          backgroundImage: `url(${previewBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "300px",
          height: "300px",
        }}
      ></div>
      <div className="flex flex-wrap gap-3 items-center  p-2">
        <div className="flex flex-col items-center">
          <div className="flex flex-wrap items-center space-x-2 z-30">
            <div className="text-2xl font-modern-era-regular">
              Pick your color
            </div>

            {Object.keys(colorMapper).map((key, index) => (
              <div
                key={index}
                onClick={() => selectBackground(key)}
                className={`w-5 h-5 rounded-full cursor-pointer ${
                  selectedColor === key ? "border-1 border-black" : ""
                }`}
                style={{
                  backgroundColor:
                    selectedColor === key
                      ? colorMapper[key as unknown as keyof typeof colorMapper]
                      : defaultColor,
                }}
              />
            ))}
          </div>
          <div className="mt-2 z-40">
            <div
              className={`flex align-center justify-center border-[1px] rounded-[8px] bg-rainbow-gradient border-transparent`}
            >
              <Button
                type="button"
                className={`px-4 py-1 rounded-[8px] bg-white font-medium font-mono text-base text-black h-8 whitespace-nowrap border-[2px] border-transparent hover:shadow-md`}
                onClick={nextStep}
                data-testid="mint-donation-button"
              >
                Mint donation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HiddenAttestationFrame = ({
  FrameProps,
  selectedBackground,
  address,
  name,
  imagesBase64,
}: {
  FrameProps: AttestationFrameProps;
  selectedBackground: string;
  address: string | undefined;
  name: string | undefined;
  imagesBase64: string[] | undefined;
}) => {
  return (
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
        projects={FrameProps.projects.map((project, i) => ({
          ...project,
          image: imagesBase64 ? imagesBase64[i] : "",
        }))}
        checkedOutChains={FrameProps.checkedOutChains}
        projectsFunded={FrameProps.projectsFunded}
        roundsSupported={FrameProps.roundsSupported}
        topRound={FrameProps.topRound}
        address={address}
        ensName={name}
      />
    </div>
  );
};
import bgImage from "../../assets/mint-your-impact-background.svg";

export const ImpactMintingSuccess = ({
  ImpactMetadata,
}: {
  ImpactMetadata?: string;
}) => {
  const {
    data: image,
    isLoading,
    isFetching,
  } = useGetImages(ImpactMetadata ? [ImpactMetadata] : [], !!ImpactMetadata);

  return (
    <div
      className="flex flex-col items-center text-center w-full relative bg-bottom bg-cover "
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="flex flex-col items-center justify-center gap-4 px-8 py-6 bg-[#ffffff66] rounded-3xl w-[430px] h-[430px]">
        <div className="flex flex-col items-center justify-center w-full ">
          <ImageWithLoading
            src={image?.[0]}
            isLoading={isLoading || !image || !ImpactMetadata || isFetching}
          />
        </div>
      </div>
      <ShareButtons />
    </div>
  );
};

// ImageWithLoading component
const ImageWithLoading = ({
  src,
  isLoading,
  ...props
}: {
  src: string | undefined;
  isLoading: boolean;
} & React.HTMLProps<HTMLDivElement>) => {
  // Fixed size of 400x400
  const sizeClass = "w-[400px] h-[400px]";

  // Handle loading and blur states
  const loadingClass = isLoading ? "animate-pulse bg-gray-100" : "";
  const blurClass = !src ? "blur-[40px]" : "";

  return (
    <div
      {...props}
      className={`bg-cover bg-center bg-gray-200 dark:bg-gray-800 ${sizeClass} ${blurClass} ${loadingClass}`}
      style={{ backgroundImage: `url("${src || ""}")` }} // Use src if available, otherwise keep it empty
    />
  );
};
