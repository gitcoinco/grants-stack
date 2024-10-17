import warningIcon from "../../../assets/warning.svg";
import { formatAmount } from "../utils/formatAmount";
import { AttestationChainId } from "../utils/constants";
import { getChainById, stringToBlobUrl } from "common";

export const BalanceDisplay = ({
  balance,
  notEnoughFunds,
}: {
  balance: bigint | undefined;
  notEnoughFunds: boolean;
}) => {
  const chain = getChainById(AttestationChainId);

  return (
    <div className="w-full flex flex-wrap border rounded-lg p-3 my-auto">
      <div className="flex items-center">
        <img
          src={stringToBlobUrl(chain.icon)}
          alt="Ethereum"
          className="h-8 w-8"
        />
        <div className="ml-3">
          <span className="text-lg font-bold">{chain.prettyName}</span>
          <div className="text-sm font-mono">
            {notEnoughFunds ? (
              <div className="flex items-center text-red-500">
                <img
                  src={warningIcon}
                  alt="errorIcon"
                  className="h-4 w-4 mr-2"
                />
                <span>Balance: {formatAmount(balance, 3)} ETH</span>
              </div>
            ) : (
              <span>Balance: {formatAmount(balance, 3)} ETH</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
