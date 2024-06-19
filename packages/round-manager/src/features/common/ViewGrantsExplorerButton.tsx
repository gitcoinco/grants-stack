import { ViewGrantsExplorerButtonType } from "./types";
import { ReactComponent as GrantExplorerLogo } from "../../assets/explorer.svg";

export function ViewGrantsExplorerButton(props: ViewGrantsExplorerButtonType) {
  const { chainId, roundId } = props;
  function redirectToGrantExplorer(
    chainId: string,
    roundId: string | undefined
  ) {
    const isAlloV1 = roundId?.startsWith("0x");
    const explorerBaseUrl = isAlloV1
      ? "https://explorer-v1.gitcoin.co"
      : process.env.REACT_APP_GRANT_EXPLORER;

    const url = `${explorerBaseUrl}/#/round/${chainId}/${roundId}`;
    setTimeout(() => {
      window.open(url, "_blank", "noopener,noreferrer");
    }, 1000);
  }

  return (
    <span
      className={`inline-flex bg-white text-gray-500 w-50 rounded-lg justify-center cursor-pointer border-gray-100 py-2 px-3 hover:border-gray-200 hover:shadow-md ${props.styles}`}
      onClick={() => {
        redirectToGrantExplorer(chainId, roundId);
      }}
      data-testid="round-explorer"
    >
      <GrantExplorerLogo className={props.iconStyle} aria-hidden="true" />
      <span className="text-xs font-mono ml-2">View round</span>
    </span>
  );
}
