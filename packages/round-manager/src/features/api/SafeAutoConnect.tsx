import { useEffect } from "react";

import { useConnect, useAccount } from "wagmi";

const AUTOCONNECTED_CONNECTOR_IDS = ["safe"];

function useAutoConnect() {
  const { connect, connectors } = useConnect();
  const { address } = useAccount();

  useEffect(() => {
    AUTOCONNECTED_CONNECTOR_IDS.forEach((connector) => {
      const connectorInstance = connectors.find((c) => c.id === connector);
      const isIframe = window.top !== window.self;
      if (connectorInstance && isIframe) {
        connect({ connector: connectorInstance });
      }
    });
  }, [connect, connectors, address]);
}

export const SafeAutoConnect = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  useAutoConnect();
  return <>{children}</>;
};
