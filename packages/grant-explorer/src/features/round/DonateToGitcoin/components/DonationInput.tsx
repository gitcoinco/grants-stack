import { useDonateToGitcoin } from "../../DonateToGitcoinContext";
import { useState, useEffect } from "react";

type Props = {
  totalAmount: string;
};

function formatAmount(num: number): string {
  return (Math.floor(num * 100) / 100).toFixed(2);
}

export function DonationInput({ totalAmount }: Props) {
  const {
    amount,
    setAmount,
    isAmountValid,
    selectedToken,
    selectedTokenBalance,
    tokenDetails,
    isEnabled,
  } = useDonateToGitcoin();

  const [selectedPercentage, setSelectedPercentage] = useState<number>(0);

  const percentages = [10, 15, 20];

  useEffect(() => {
    if (isEnabled) {
      const calculatedAmount = Number(totalAmount) * (10 / 100);
      setAmount(formatAmount(calculatedAmount));
      setSelectedPercentage(10);
    } else {
      setAmount("0.00");
    }
  }, [isEnabled, totalAmount, setAmount]);

  const handlePercentageClick = (percentage: number) => {
    console.log("Percentage clicked:", percentage);
    const calculatedAmount = Number(totalAmount) * (percentage / 100);
    console.log("Calculating new amount:", {
      totalAmount,
      percentage,
      calculatedAmount,
      formatted: formatAmount(calculatedAmount),
    });
    setAmount(formatAmount(calculatedAmount));
    setSelectedPercentage(percentage);
    console.log("Updated values:", {
      amount: formatAmount(calculatedAmount),
      selectedPercentage: percentage,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      // Check if the new amount matches any percentage
      const newPercentage = percentages.find(
        (p) => formatAmount(Number(totalAmount) * (p / 100)) === value
      );
      setSelectedPercentage(newPercentage || 10);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      {percentages.map((percentage) => (
        <button
          key={percentage}
          onClick={() => handlePercentageClick(percentage)}
          className={`
            flex justify-content-center items-center
            w-[68px] h-[32px]
            px-4 py-2
            rounded-[8px]
            border border-solid
            shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]
            font-inter text-[12px] font-medium text-black
            ${
              selectedPercentage === percentage
                ? "border-[#7D67EB]"
                : "border-[#D7D7D7]"
            }
            bg-white
          `}
        >
          +{percentage}%
        </button>
      ))}
      <div className="relative flex-[3]">
        <div className="absolute left-3 top-[10px] text-[14px] font-medium font-inter text-black">
          $
        </div>
        <input
          type="text"
          className={`
            w-full rounded-[6px] 
            border-[0.75px] border-[#D7D7D7]
            p-[7.5px] pr-3 pl-6
            text-[12px] font-medium font-inter text-black
            text-right
            ${isAmountValid ? "bg-white" : "border-red-300"}
          `}
          value={amount}
          onChange={handleChange}
          placeholder="Enter amount"
          max={selectedTokenBalance}
        />
      </div>
    </div>
  );
}
