import React from "react";
import { Button } from "common/src/styles";
import useColorAndBackground from "../../hooks/attestations/useColorAndBackground";
import { ShareButtons } from "../common/ShareButtons";
import { useGetImages } from "../../hooks/attestations/useGetImages";

export const PreviewFrame = ({
  handleSelectBackground,
  mint,
}: {
  handleSelectBackground: (option: string) => void;
  mint: () => void;
}) => {
  const { backgroundAlternatives, defaultColor, colorMapper, preview_alt1 } =
    useColorAndBackground();

  const [selectedColor, setSelectedColor] = React.useState("0");
  const [previewBackground, setPreviewBackground] =
    React.useState(preview_alt1);

  function selectBackground(option: string) {
    setSelectedColor(option);
    setPreviewBackground(backgroundAlternatives[Number(option)]);
    handleSelectBackground(option);
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
          <div className="flex flex-wrap items-center space-x-2 z-30 my-3">
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
    <div className="flex flex-col items-center gap-2 sm:gap-6">
      <img
        className="w-full max-w-[400px] min-w-[287px]"
        src={previewBackground}
        alt="preview"
      />
      <div className="flex flex-wrap items-center space-x-2 z-30">
        <div className="text-lg font-modern-era-regular">Pick your color</div>
        {Object.keys(colorMapper).map((key, index) => {
          const isSelected = selectedColor === index.toString();
          return (
            <div
              key={index}
              onClick={() => selectBackground(key)}
              className={`size-5 rounded-full cursor-pointer ${
                isSelected
                  ? "border border-[#555555] bg-[${colorMapper[key as unknown as keyof typeof colorMapper]}]"
                  : `bg-[${defaultColor}]`
              }`}
              style={{
                backgroundColor: isSelected
                  ? colorMapper[key as unknown as keyof typeof colorMapper]
                  : defaultColor,
              }}
            />
          );
        })}
      </div>
      <div
        className={`flex align-center justify-center border-[1px] rounded-[8px] bg-rainbow-gradient border-transparent`}
      >
        <Button
          type="button"
          className={`px-4 py-1 rounded-[8px] bg-white font-medium font-mono text-base text-black h-12 sm:h-8 whitespace-nowrap border-transparent hover:shadow-md`}
          onClick={nextStep}
          data-testid="mint-donation-button"
        >
          Mint your donation
        </Button>
      </div>
    </div>
  );
};

import { ImageWithLoading } from "../common/components/ImageWithLoading";

export const ImpactMintingSuccess = ({
  attestationLink,
  impactImageCid,
  imageSize = "size-[400px]",
  isShareButtonsAbove = true,
}: {
  attestationLink: string;
  impactImageCid?: string;
  imageSize?: string;
  isShareButtonsAbove?: boolean;
}) => {
  const {
    data: image,
    isLoading,
    isFetching,
  } = useGetImages(impactImageCid ? [impactImageCid] : [], !!impactImageCid);

  return isShareButtonsAbove ? (
    <div className="flex flex-col items-center gap-6">
      <ShareButtons
        attestationLink={attestationLink}
        isTop={isShareButtonsAbove}
      />
      <ImageWithLoading
        src={image?.[0]}
        isLoading={isLoading || !image || !impactImageCid || isFetching}
        sizeClass={imageSize}
      />
    </div>
  ) : (
    <div className="flex flex-col items-center gap-6">
      <ImageWithLoading
        src={image?.[0]}
        isLoading={isLoading || !image || !impactImageCid || isFetching}
        sizeClass={imageSize}
      />
      <ShareButtons
        attestationLink={attestationLink}
        isTop={isShareButtonsAbove}
      />
    </div>
  );
};
