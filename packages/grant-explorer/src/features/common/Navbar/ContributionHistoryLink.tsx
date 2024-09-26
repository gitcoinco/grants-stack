import { Link } from "react-router-dom";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useAccount } from "wagmi";

export default function ContributionHistoryLink() {
  const { address: walletAddress } = useAccount();

  return walletAddress ? (
    <div data-testid="contributor-page-link" id="contributor-page-link">
      <Link
        to={`/contributors/${walletAddress}`}
        className="flex-shrink-0 flex items-center ph-no-capture"
        data-testid={"contributions-link"}
      >
        <UserCircleIcon className="h-8 w-8 ph-no-capture" />
      </Link>
    </div>
  ) : null;
}
