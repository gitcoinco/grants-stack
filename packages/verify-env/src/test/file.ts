const isDevelopment = process.env.REACT_APP_ENV === "development";

const projectId =
  process.env.REACT_APP_WALLETCONNECT_PROJECT_ID ??
  "2685061cae0bcaf2b244446153eda9e1";
export const apiKey = process.env.REACT_APP_INFURA_ID,
  alchemyKey = process.env.REACT_APP_ALCHEMY_ID;
