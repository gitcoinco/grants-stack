import Footer from "common/src/components/Footer";
import { lazy, Suspense, useState, useEffect } from "react";
import {
  getActiveRounds,
  getRoundsInApplicationPhase,
  RoundOverview,
} from "../api/rounds";
import { useDebugMode } from "../api/utils";
import Navbar from "../common/Navbar";
import ActiveRoundsSection from "./ActiveRoundSection";
import ApplyNowSection from "./ApplyNowSection";
import useSWR from "swr";
const LandingBannerLogo = lazy(() => import("../../assets/LandingBanner"));

export function useActiveRounds() {
  const debugModeEnabled = useDebugMode();
  return useSWR(`activeRounds`, () => getActiveRounds(debugModeEnabled));
}

export function useRoundsInApplicationPhase() {
  const debugModeEnabled = useDebugMode();
  return useSWR(`applicationRounds`, () =>
    getRoundsInApplicationPhase(debugModeEnabled)
  );
}

const LandingPage = () => {
  useEffect(() => {
    if (process.env.REACT_APP_ENV === "production") {
      window.location.replace("https://grants.gitcoin.co");
    }
  }, []);

  const [searchQuery, setSearchQuery] = useState("");

  const { isLoading: activeRoundsLoading, data: activeRounds } =
    useActiveRounds();

  const { isLoading: applyRoundsLoading, data: roundsInApplicationPhase } =
    useRoundsInApplicationPhase();
  return (
    <>
      <Navbar showWalletInteraction={true} />
      <div className=" mx-auto pt-8">
        <main>
          <Suspense
            fallback={
              <div
                style={{
                  width: "100%",
                  height: "582px",
                }}
              />
            }
          >
            <LandingBannerLogo className="w-full h-auto object-cover rounded-t" />
          </Suspense>
          <div className="container px-4 md:px-0 md:mx-auto">
            <h1 className="text-3xl mt-11 mb-10 border-b-2 pb-4">
              Browse through active rounds
            </h1>
            <ApplyNowSection
              isLoading={applyRoundsLoading}
              roundOverview={roundsInApplicationPhase}
            />
            <ActiveRoundsSection
              isLoading={activeRoundsLoading}
              setSearchQuery={setSearchQuery}
              roundOverview={filterProjectsByTitle(
                activeRounds ?? [],
                searchQuery
              )}
              searchQuery={searchQuery}
            />
          </div>
        </main>
        <div className="my-11">
          <Footer />
        </div>
      </div>
    </>
  );
};

const filterProjectsByTitle = (rounds: RoundOverview[], query: string) => {
  // filter by exact title matches first
  // e.g if searchString is "ether" then "ether grant" comes before "ethereum grant"

  if (query.trim() === "") {
    return rounds;
  }

  const exactMatches = rounds.filter(
    (round) =>
      round.roundMetadata?.name?.toLocaleLowerCase() ===
      query.toLocaleLowerCase()
  );

  const nonExactMatches = rounds.filter(
    (round) =>
      round.roundMetadata?.name
        ?.toLocaleLowerCase()
        .includes(query.toLocaleLowerCase()) &&
      round.roundMetadata?.name?.toLocaleLowerCase() !==
        query.toLocaleLowerCase()
  );

  return [...exactMatches, ...nonExactMatches];
};

export default LandingPage;
