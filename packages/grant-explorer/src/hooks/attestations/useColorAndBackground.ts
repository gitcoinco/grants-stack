import React from "react";
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
import attestationFrameLogo from "../../assets/attestation-frame-logo.svg";

const useColorAndBackground = () => {
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
  const [previousColor, setPreviousColor] = React.useState("-0");
  const [selectedBackground, setSelectedBackground] = React.useState(
    backgroundMapper["0"]
  );
  const [previewBackground, setPreviewBackground] =
    React.useState(preview_alt1);

  const selectBackground = (option: string) => {
    setPreviousColor(selectedColor);
    setSelectedColor(option);
    setPreviewBackground(backgroundAlternatives[Number(option)]);
    setSelectedBackground(
      backgroundMapper[option as keyof typeof backgroundMapper]
    );
  };

  return {
    colorMapper,
    backgroundMapper,
    defaultColor,
    backgroundAlternatives,
    selectedColor,
    previousColor,
    previewBackground,
    selectBackground,
    selectedBackground,
    preview_alt1,
    attestationFrameLogo,
  };
};

export default useColorAndBackground;
