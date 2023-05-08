import colors from "../../styles/colors";
import Shield from "../icons/Shield";

function GreenVerifiedBadge() {
  return (
    <div className="flex rounded-full bg-teal-100 px-2 py-0.5 mt-1">
      <Shield dimension={16} color={colors["green-text"]} />{" "}
      <p className="pl-1 text-green-text text-xs font-normal mt-0.5">
        Verified
      </p>
    </div>
  );
}

export default GreenVerifiedBadge;
