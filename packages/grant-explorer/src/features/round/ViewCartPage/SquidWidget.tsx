import React, { useState } from 'react';

const SquidWidget = ({
  integratorId = 'squid-swap-widget',
  companyName = 'Gitcoin',
  neutralContent = '#C4AEEC',
  baseContent = '#070002',
  base100 = '#ffffff',
  base200 = '#fafafa',
  base300 = '#e8e8e8',
  error = '#ED6A5E',
  warning = '#FFB155',
  success = '#2EAEB0',
  primary = '#A992EA',
  secondary = '#F89CC3',
  secondaryContent = '#F7F6FB',
  neutral = '#FFFFFF',
  roundedBtn = '26px',
  roundedCornerBtn = '999px',
  roundedBox = '1rem',
  roundedDropDown = '20rem',
  slippage = 1.5,
  infiniteApproval = false,
  enableExpress = true,
  apiUrl = 'https://api.squidrouter.com',
  comingSoonChainIds = [],
  iframeBackgroundColorHex = '#FFF',
  initialFromChainId = 1,
  initialToChainId = 10,
  fromTokenAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  toTokenAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
}) => {
  // State to manage loading
  const [loading, setLoading] = useState(true);

  // Construct the config object
  const config = {
    integratorId,
    companyName,
    style: {
      neutralContent,
      baseContent,
      base100,
      base200,
      base300,
      error,
      warning,
      success,
      primary,
      secondary,
      secondaryContent,
      neutral,
      roundedBtn,
      roundedCornerBtn,
      roundedBox,
      roundedDropDown,
    },
    slippage,
    infiniteApproval,
    enableExpress,
    apiUrl,
    comingSoonChainIds,
    environment: 'mainnet',
    showOnRampLink: true,
    iframeBackgroundColorHex,
    initialFromChainId,
    initialToChainId,
    defaultTokens: [
      {
        address: fromTokenAddress, 
        chainId: initialFromChainId,
      },
      {
        address: toTokenAddress,
        chainId: initialToChainId,
      },
    ],
  };

  // Convert config object to a URI-encoded JSON string
  const configString = encodeURIComponent(JSON.stringify(config));

  // Construct the iframe URL
  const iframeUrl = `https://widget.squidrouter.com/iframe?config=${configString}`;

  // Handler for when iframe loads
  const handleIframeLoad = () => {
    setLoading(false);
  };

  return (
    <div style={{ position: 'relative', width: '500', height: '684px' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '18px',
          color: '#333',
        }}>
          Loading...
        </div>
      )}
      <iframe
        title="squid_widget"
        width="500"
        height="684"
        src={iframeUrl}
        onLoad={handleIframeLoad}
        style={{ display: loading ? 'none' : 'block' }} // Hide iframe until loaded
      />
    </div>
  );
};

export default SquidWidget;
