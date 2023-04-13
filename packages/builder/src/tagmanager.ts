import TagManager from "react-gtm-module";

const initTagmanager = () => {
  if (process.env.REACT_APP_TAG_MANAGER) {
    TagManager.initialize({
      gtmId: `${process.env.REACT_APP_TAG_MANAGER}`,
      events: {
        "gtm.start": new Date().getTime(),
        event: "gtm.js",
      },
    });
  }
};

export default initTagmanager;
