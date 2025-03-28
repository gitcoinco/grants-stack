import { useDonateToGitcoin } from "../../DonateToGitcoinContext";

export function TotalAmountInclGitcoinDonation({
  totalDonationAcrossChainsInUSD,
}: {
  totalDonationAcrossChainsInUSD: number;
}) {
  const { amount } = useDonateToGitcoin();
  const totalAmount = totalDonationAcrossChainsInUSD + Number(amount);

  return (
    <div>
      <span className="font-inter text-[15px] font-medium text-black">
        ~${totalAmount.toFixed(2)}
      </span>
    </div>
  );
}
