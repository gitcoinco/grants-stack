import { lazy, Suspense, useEffect, useState } from "react";
const LandingBannerLogo = lazy(() => import("../../assets/LandingBanner"));
import { RoundOverview, getRoundsInApplicationPhase } from "../api/rounds";
import Breadcrumb from "../common/Breadcrumb";
import Navbar from "../common/Navbar";
import SearchInput, { SortFilterDropdown } from "../common/SearchInput";
import { Spinner } from "../common/Spinner";
import NoRounds from "./NoRounds";
import RoundCard from "./RoundCard";
import { useDebugMode } from "../api/utils";
import Footer from "common/src/components/Footer";

const ApplyNowPage = () => {
  const [roundsInApplicationPhase, setRoundsInApplicationPhase] = useState<
    RoundOverview[]
  >([]);
  const [
    filteredRoundsInApplicationPhase,
    setFilteredRoundsInApplicationPhase,
  ] = useState<RoundOverview[]>([]);
  const [applyRoundsLoading, setApplyRoundsLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [order, setOrder] = useState<string>("round_asc");

  const debugModeEnabled = useDebugMode();

  function sortRoundsByTime(rounds: RoundOverview[], order: string) {
    // If order is round_asc, sort in ascending order. Otherwise, sort in descending order.
    const isAscending = order === "round_asc";

    // Use the sort method to sort the rounds array based on the start or end time
    rounds.sort((a: RoundOverview, b: RoundOverview) => {
      const timeA = isAscending
        ? Number(a.roundStartTime)
        : Number(a.roundEndTime);
      const timeB = isAscending
        ? Number(b.roundStartTime)
        : Number(b.roundEndTime);
      return timeA - timeB;
    });

    // Return the sorted array
    return rounds;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (searchQuery) {
      const timeOutId = setTimeout(
        () => filterProjectsByTitle(searchQuery),
        300
      );
      return () => clearTimeout(timeOutId);
    } else {
      setFilteredRoundsInApplicationPhase(roundsInApplicationPhase);
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const filterProjectsByTitle = (query: string) => {
    // filter by exact title matches first
    // e.g if searchString is "ether" then "ether grant" comes before "ethereum grant"

    if (query.trim() === "") {
      setFilteredRoundsInApplicationPhase(roundsInApplicationPhase);
      return;
    }

    const exactMatches = roundsInApplicationPhase?.filter(
      (round) =>
        round.roundMetadata?.name?.toLocaleLowerCase() ===
        query.toLocaleLowerCase()
    );

    const nonExactMatches = roundsInApplicationPhase?.filter(
      (round) =>
        round.roundMetadata?.name
          ?.toLocaleLowerCase()
          .includes(query.toLocaleLowerCase()) &&
        round.roundMetadata?.name?.toLocaleLowerCase() !==
          query.toLocaleLowerCase()
    );

    setFilteredRoundsInApplicationPhase([
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...exactMatches!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...nonExactMatches!,
    ]);
  };

  const applyNowRoundsCount = filteredRoundsInApplicationPhase.length;

  // Fetch rounds in application phase
  useEffect(() => {
    const fetchRoundsInApplicationPhase = async () => {
      const rounds = await getRoundsInApplicationPhase(debugModeEnabled);
      setRoundsInApplicationPhase(rounds);
      setFilteredRoundsInApplicationPhase(rounds);
      setApplyRoundsLoading(false);
      console.log("Rounds in Application Phase: ", {
        roundsInApplicationPhase,
      });
    };
    fetchRoundsInApplicationPhase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line prefer-const
  let breadcrumbItems = [
    {
      name: "All Rounds",
      path: "/",
    },
    {
      name: "Apply Now",
      path: "/apply-now",
    },
  ];

  return (
    <>
      <Navbar showWalletInteraction={false} />
      <Suspense
        fallback={
          <div
            style={{
              width: "100%",
              height: "560px",
            }}
          />
        }
      >
        <LandingBannerLogo className="w-full h-auto object-cover rounded-t" />
      </Suspense>
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
                setOrder(e.target.value)
              }
            />
          </div>
        </div>
        {applyRoundsLoading ? (
          <Spinner />
        ) : applyNowRoundsCount > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:gap-6 2xl:grid-cols-4">
            {sortRoundsByTime(filteredRoundsInApplicationPhase, order).map(
              (round, index) => {
                return <RoundCard key={index} round={round} />;
              }
            )}
          </div>
        ) : (
          <NoRounds type="apply" />
        )}
        <div className="my-11">
          <Footer />
        </div>
      </div>
    </>
  );
};

export default ApplyNowPage;
