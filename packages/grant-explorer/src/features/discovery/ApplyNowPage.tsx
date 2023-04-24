import { useEffect, useState } from "react";
import { ReactComponent as LandingBannerLogo } from "../../assets/landing-banner.svg";
import { RoundOverview, getRoundsInApplicationPhase } from "../api/rounds";
import Breadcrumb from "../common/Breadcrumb";
import Navbar from "../common/Navbar";
import SearchInput, { SortFilterDropdown } from "../common/SearchInput";
import { Spinner } from "../common/Spinner";
import NoRounds from "./NoRounds";
import RoundCard from "./RoundCard";

const ApplyNowPage = () => {
  const [roundsInApplicationPhase, setRoundsInApplicationPhase] = useState<
    RoundOverview[]
  >([]);
  const [applyRoundsLoading, setApplyRoundsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");

  const applyNowRoundsCount = roundsInApplicationPhase.length;

  // Fetch rounds in application phase
  useEffect(() => {
    const fetchRoundsInApplicationPhase = async () => {
      const { isLoading, error, rounds } = await getRoundsInApplicationPhase();
      setRoundsInApplicationPhase(rounds);
      setApplyRoundsLoading(isLoading);
      console.log("Rounds in Application Phase: ", {
        roundsInApplicationPhase,
        isLoading,
        error,
      });
    };
    fetchRoundsInApplicationPhase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // todo: updating the breadcrumb items
  // eslint-disable-next-line prefer-const
  let breadcrumbItems = [
    {
      name: "All Rounds",
      path: "/",
    },
    {
      name: "Apply Now",
      path: "/",
    },
  ];

  return (
    <>
      <Navbar roundUrlPath={"/"} showWalletInteraction={false} />
      <LandingBannerLogo className="w-full h-auto object-cover rounded-t" />
      <div className="container px-4 md:px-0 md:mx-auto mt-4">
        <div className="my-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <div className="flex flex-col lg:flex-row md:flex-row justify-between items-center">
          <div className="flex flex-col justify-between">
            <p className="text-grey-400 text-2xl">
              Apply Now ({applyNowRoundsCount})
            </p>
            <p className="text-grey-400 mb-2 lg:mb-4 mt-2">
              Rounds currently accepting applications
            </p>
          </div>
          <div className="flex flex-col lg:flex-row my-auto">
            <SearchInput searchQuery={searchQuery} onChange={setSearchQuery} />
            <SortFilterDropdown
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e: { target: { value: any } }) =>
                console.log(e.target.value)
              }
            />
          </div>
        </div>
        {applyRoundsLoading ? (
          <Spinner />
        ) : applyNowRoundsCount > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
            {roundsInApplicationPhase.map((round, index) => {
              return <RoundCard key={index} round={round} />;
            })}
          </div>
        ) : (
          <NoRounds type="apply" />
        )}
      </div>
    </>
  );
};

export default ApplyNowPage;
