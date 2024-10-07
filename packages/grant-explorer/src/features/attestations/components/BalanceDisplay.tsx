import warningIcon from "../../../assets/warning.svg";
import ethereumIcon from "../../../assets/icons/ethereum-icon.svg";
import { formatAmount } from "../utils/formatAmount";

export const BalanceDisplay = ({
  balance,
  notEnoughFunds,
}: {
  balance: bigint | undefined;
  notEnoughFunds: boolean;
}) => (
  <div className="w-full flex flex-wrap border rounded-lg p-3 my-auto">
    <div className="flex items-center">
      <img src={ethereumIcon} alt="Ethereum" className="h-8 w-8" />
      <div className="ml-5">
        <span className="text-lg font-bold">Mainnet</span>
        <div className="text-sm font-mono">
          {notEnoughFunds ? (
            <div className="flex items-center text-red-500">
              <img src={warningIcon} alt="errorIcon" className="h-4 w-4 mr-2" />
              <span>Balance: {formatAmount(balance)} ETH</span>
            </div>
          ) : (
            <span>Balance: {formatAmount(balance)} ETH</span>
          )}
        </div>
      </div>
    </div>
  </div>
);
