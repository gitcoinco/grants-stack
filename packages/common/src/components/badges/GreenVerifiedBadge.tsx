import colors from "../../colors";
import Shield from "../../icons/Shield";

function GreenVerifiedBadge() {
  return (
    <div data-testid="verified-badge" className="flex rounded-full" style={{ backgroundColor: "#E6FFF9", padding: "0.25rem 0.5rem 0.25rem 0.5rem" }}>
      <Shield dimension={16} color={colors["green-text"]} />{" "}
      <p className={`pl-1 text-xs font-normal`} style={{ color: colors["green-text"] }}>Verified</p>
    </div>
  );
}

export default GreenVerifiedBadge;
