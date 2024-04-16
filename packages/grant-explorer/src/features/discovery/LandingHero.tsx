import { ReactComponent as Logo } from "../../assets/landing-banner.svg";
import { ReactComponent as Check } from "../../assets/icons/by-the-numbers-check.svg";
import LandingTabs from "./LandingTabs";

export default function LandingHero() {
  return (
    <div>
      <div className="flex items-center gap-12 lg:gap-24 mb-16">
        <ByTheNumbers />
        <Logo />
      </div>
      <LandingTabs />
    </div>
  );
}

const ByTheNumbers = () => {
  // TODO: fetch data (where to get this?)
  const uniqueDonations = "4.6M";
  const raisedFunds = "5,242";
  const fundingDistributed = "$60,000,000+";

  return (
    <div className="w-[300px] lg:w-[380px] h-[460px] flex-shrink-0 flex-col justify-between bg-white/50 hidden md:flex rounded-b-3xl px-6 py-8">
      <div className="flex items-center gap-4">
        <Check />
        <div className="font-medium text-xl lg:text-2xl">By the numbers…</div>
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
      <div className="font-mono text-3xl lg:text-4xl text-green-300 font-medium tracking-tighter mb-1">
        {value}
      </div>
      <div className="uppercase text-base lg:text-lg tracking-widest font-medium">
        {label}
      </div>
    </div>
  );
};
