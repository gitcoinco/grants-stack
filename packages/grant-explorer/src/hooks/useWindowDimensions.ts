import { useState, useEffect } from "react";

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return { width, height };
}

export default function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    let throttled = false;
    let timeoutId: NodeJS.Timeout | undefined;
    function handleResize() {
      if (!throttled) {
        setWindowDimensions(getWindowDimensions());
        throttled = true;
        timeoutId = setTimeout(() => {
          throttled = false;
        }, 300);
      }
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      timeoutId && clearTimeout(timeoutId);
    };
  }, []);

  return windowDimensions;
}
