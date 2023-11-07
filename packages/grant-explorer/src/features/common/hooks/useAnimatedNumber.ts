import { AnimeParams } from "animejs";
import anime from "animejs/lib/anime.es.js";
import { useEffect, useState } from "react";

type Params = {
  value: number;
  round?: number;
  start?: number;
  duration?: number;
  easing?: AnimeParams["easing"];
};
export function useAnimateNumber(params: Params) {
  const {
    value = 0,
    round = 1,
    start = 0,
    easing = "linear",
    duration = 1000,
  } = params;
  const [animatedValue, setValue] = useState(start);

  useEffect(() => {
    const targets = { value: 0 };
    anime({
      targets,
      value,
      round,
      easing,
      duration,
      update: () => setValue(targets.value),
    });
  }, []);

  return animatedValue;
}
