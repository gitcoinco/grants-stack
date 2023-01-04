import ReactGA from "react-ga4";

export const initTagmanager = () => {
  if (process.env.REACT_APP_TAG_MANAGER) {
    ReactGA.initialize(`${process.env.REACT_APP_TAG_MANAGER}`);
  }
};
