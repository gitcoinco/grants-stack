export type SwapParams = {
  fromChainId: string;
  toChainId: string;
  // amount: string;
  fromTokenAddress?: string;
  toTokenAddress?: string;
};

const SquidWidget = ({
  fromChainId,
  toChainId,
  fromTokenAddress,
  toTokenAddress,
}: SwapParams) => {

  // Construct the config object
  const config = {
    integratorId: "squid-swap-widget",
    instantExec: true,
    apiUrl: "https://apiplus.squidrouter.com",
    initialAssets: {
      from: {
        chainId: fromChainId,
        address: fromTokenAddress?.toLowerCase(),
      },
      to: {
        chainId: toChainId,
        address: toTokenAddress?.toLowerCase(),
      },
    },
  };

  // Convert config object to a URI-encoded JSON string
  const configString = encodeURIComponent(JSON.stringify(config));

  // Construct the iframe URL
  const iframeUrl = `https://studio.squidrouter.com/iframe?config=${configString}`;

  return (
    <div style={{ position: "relative", width: "500", height: "684px" }}>
      <iframe
        title="squid_widget"
        width="500"
        height="684"
        src={iframeUrl}
        style={{ display: "block" }}
      />
    </div>
  );
};

export default SquidWidget;
