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

  // Construct the config objectq
  const config = {
    integratorId: "gitcoin-50ed7b9e-5407-48c2-9b94-f443b53f6cd4",
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
    disabledChains: {
      source: [
        "pacific-1",
        "osmosis-1"
      ],
      destination: [
        "pacific-1",
        "osmosis-1"
      ]
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
