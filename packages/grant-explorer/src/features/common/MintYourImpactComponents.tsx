import { useAccount } from "wagmi";
import gg22Logo from "../../assets/gg22-logo.svg";
import alt1 from "../../assets/alt1.svg";
import alt2 from "../../assets/alt2.svg";
import alt3 from "../../assets/alt3.svg";
import alt4 from "../../assets/alt4.svg";
import alt5 from "../../assets/alt5.svg";
import preview_alt1 from "../../assets/preview_alt_1.svg";
import preview_alt2 from "../../assets/preview_alt_2.svg";
import preview_alt3 from "../../assets/preview_alt_3.svg";
import preview_alt4 from "../../assets/preview_alt_4.svg";
import preview_alt5 from "../../assets/preview_alt_5.svg";
import React from "react";
import { Button } from "common/src/styles";

export const MintYourImpactShadowBg = () => {
  return (
    <svg
      width="800"
      height="790"
      viewBox="0 0 800 790"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute my-auto mx-auto"
    >
      <path
        d="M0 400C0 175 175 0 375 0H450C650 0 800 175 800 400V790H0V400Z"
        fill="url(#paint0_linear_314_8370)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_314_8370"
          x1="400"
          y1="0"
          x2="400"
          y2="790"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EBEBEB" />
          <stop offset="1" stopColor="#F1F1F1" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};

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
}: {
  selectedBackground: string;
  topRound: string;
  projectsFunded: number;
  roundsSupported: number;
  checkedOutChains: number;
  projects: Project[];
}) => {
  const { address } = useAccount();
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative rounded-3xl overflow-hidden"
        id="print"
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
          <div className="flex items-center justify-between p-5 border border-black rounded-t-lg bg-white bg-opacity-10 overflow-auto">
            <div className="font-mono font-medium text-black text-sm">
              {address}
            </div>
            <img className="h-10" alt="Logo" src={gg22Logo} />
          </div>

          {/* Main Body */}
          <div className="flex flex-1 w-full bg-white bg-opacity-10 border-x border-b border-black rounded-b-lg overflow-hidden">
            {/* Left Section (Top Projects and Top Round) */}
            <div className="flex flex-col flex-1 h-full p-5">
              {/* Top Projects Header */}
              <div className="w-full pb-4 border-b border-black">
                <h2 className="font-mono font-medium text-black text-[18px]">
                  Top Projects
                </h2>
              </div>

              {/* Project List */}
              <div
                className="flex-1 truncate"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
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
                      <p className="text-gray-600 text-[12px]">
                        {project.round}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex flex-col mt-6">
                  <p className="text-black text-[20px] font-medium font-mono">
                    Top Round
                  </p>
                </div>
                <div className="flex flex-col ">
                  <p className="text-black absolute bottom-12 text-[32px] font-medium">
                    {topRound}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section (Stats) */}
            <div className="flex flex-col w-[250px] p-5 border-l border-black">
              {[
                { value: projectsFunded, label: "Projects Funded" },
                { value: roundsSupported, label: "Rounds Supported" },
                { value: checkedOutChains, label: "Chains" },
              ].map((stat, index) => (
                <div key={index} className="flex flex-col py-4">
                  <div className="text-[48px] font-bold font-mono text-black">
                    {stat.value}
                  </div>
                  <div className="text-[16px] mt-2 font-medium font-mono text-black">
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
  const colorMapper = {
    "0": "#8266BE",
    "1": "#79A557",
    "2": "#9BC8E7",
    "3": "#E3734C",
    "4": "#BCBFBF",
  };

  const backgroundMapper = {
    "0": alt1,
    "1": alt2,
    "2": alt3,
    "3": alt4,
    "4": alt5,
  };

  const defaultColor = "#EBEBEB";

  const backgroundAlternatives = [
    preview_alt1,
    preview_alt2,
    preview_alt3,
    preview_alt4,
    preview_alt5,
  ];

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
        id="print"
        style={{
          backgroundImage: `url(${previewBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "400px",
          height: "400px",
        }}
      ></div>
      <div className="flex flex-wrap gap-3 items-center mt-3 bg-white opacity-80  p-2">
        <div className="flex flex-col items-center">
          <div className="flex flex-wrap items-center space-x-2 z-50">
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
          <div className="mt-2 mb-8 z-50">
            <Button
              type="button"
              className="flex items-center justify-center text-xl rounded-lg border-1 font-mono font-bold text-black bg-white px-10 sm:px-10 shadow-md hover:shadow-lg mt-2"
              onClick={mint}
            >
              Mint your Donation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
