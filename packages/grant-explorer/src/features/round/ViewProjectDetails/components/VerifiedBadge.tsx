import { ShieldCheckIcon } from "@heroicons/react/24/solid";

export function VerifiedBadge() {
  return (
    <span className="bg-teal-100 flex gap-2 rounded-full px-2 text-xs items-center font-modern-era-medium text-teal-500">
      <ShieldCheckIcon className="w-4 h-4" />
      Verified
    </span>
  );
}
