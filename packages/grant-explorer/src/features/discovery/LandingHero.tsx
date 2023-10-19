import { ReactComponent as Logo } from "../../assets/landing-banner.svg";
import { ReactComponent as Check } from "../../assets/icons/by-the-numbers-check.svg";
import LandingTabs from "./LandingTabs";

export default function LandingHero() {
  return (
    <div>
      <div className="flex items-center gap-16 mb-16">
        <ByTheNumbers />
        <Logo />
      </div>
      <LandingTabs />
    </div>
  );
}

const ByTheNumbers = () => {
  // TODO: fetch data (where to get this?)
  const uniqueDonations = "3.8M";
  const raisedFunds = "3,715";
  const fundingDistributed = "$50,000,000+";

  return (
    <div className="w-[520px] h-[609px] flex-shrink-0 flex-col justify-between bg-white/50 hidden md:flex rounded-b-3xl px-8 py-12">
      <div className="flex items-center gap-4">
        <Check />
        <div className="font-medium text-3xl">By the numbers…</div>
      </div>

      <Stat value={uniqueDonations} label="Unique donations" />
      <Stat value={raisedFunds} label="Projects raised funds" />
      <Stat value={fundingDistributed} label="In funding distributed" />
    </div>
  );
};

const Stat = ({ value = "", label = "" }) => {
  return (
    <div>
      <div className="font-mono text-5xl text-green-300 font-medium tracking-tighter mb-1">
        {value}
      </div>
      <div className="uppercase text-xl tracking-widest font-medium">
        {label}
      </div>
    </div>
  );
};
