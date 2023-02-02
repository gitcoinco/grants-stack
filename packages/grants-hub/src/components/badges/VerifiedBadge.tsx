import { Shield } from "../../assets/icons";

function VerifiedBadge() {
  return (
    <div className="flex ml-8 mt-14">
      <img src={Shield} alt="Shield Logo" className="h-6 mr-2" />
      <p className="text-green-text font-normal">Verified</p>
    </div>
  );
}

export default VerifiedBadge;
