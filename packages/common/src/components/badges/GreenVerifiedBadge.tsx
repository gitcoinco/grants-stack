import colors from "../../colors";
import Shield from "../../icons/Shield";

function GreenVerifiedBadge() {
  return (
    <div data-testid="verified-badge" className="flex rounded-full bg-teal-100 px-2 py-0.5">
      <Shield dimension={16} color={colors["green-text"]} />{" "}
      <p className={`pl-1 text-xs font-normal`} style={{ color: colors["green-text"] }}>Verified</p>
    </div>
  );
}

export default GreenVerifiedBadge;
