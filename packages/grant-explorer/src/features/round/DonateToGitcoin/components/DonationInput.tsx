import { useDonateToGitcoin } from "../../DonateToGitcoinContext";

export function DonationInput() {
  const {
    amount,
    setAmount,
    isAmountValid,
    selectedToken,
    selectedTokenBalance,
    tokenDetails,
  } = useDonateToGitcoin();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };
  return (
    <div className="relative flex-grow max-w-[200px]">
      <input
        type="text"
        className={`w-full rounded-lg border py-2 px-3 text-sm shadow-sm hover:border-gray-300 ${
          isAmountValid ? "border-gray-200" : "border-red-300"
        }`}
        value={amount}
        onChange={handleChange}
        placeholder="Enter amount"
        max={selectedTokenBalance}
      />
      {selectedToken && (
        <div className="absolute right-3 top-2.5 text-xs text-gray-500">
          {tokenDetails?.code}
        </div>
      )}
    </div>
  );
}
