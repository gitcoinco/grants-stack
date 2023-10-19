import { PassportResponse } from "common";
import { useMemo } from "react";

export type PassportColor = "gray" | "orange" | "yellow" | "green";

export type PassportDisplay = {
  score: number;
  color: PassportColor;
};

export function passportColorTextClass(color: PassportColor): string {
  switch (color) {
    case "gray":
      return "text-gray-400";
    case "orange":
      return "text-orange-400";
    case "yellow":
      return "text-yellow-400";
    case "green":
      return "text-green-400";
  }
}

function passportDisplayColorFromScore(score: number | null): PassportColor {
  if (score === null) {
    return "gray";
  } else if (score < 15) {
    return "orange";
  } else if (score < 25) {
    return "yellow";
  }

  return "green";
}

export function usePassportScore(score?: PassportResponse) {
  const passportScore = useMemo(() => {
    if (score?.evidence?.rawScore === undefined) {
      return null;
    }

    return Number(score.evidence.rawScore);
  }, [score]);

  return {
    score: passportScore,
    color: passportDisplayColorFromScore(passportScore),
  };
}
