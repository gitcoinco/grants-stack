import Footer from "common/src/components/Footer";
import { lazy, Suspense, useEffect, useState } from "react";
import {
  getActiveRounds,
  getRoundsInApplicationPhase,
  RoundOverview,
} from "../api/rounds";
import { useDebugMode } from "../api/utils";
import Navbar from "../common/Navbar";
import ActiveRoundsSection from "./ActiveRoundSection";
import ApplyNowSection from "./ApplyNowSection";
import { ROUND_PAYOUT_DIRECT, ROUND_PAYOUT_MERKLE } from "../../constants";

const LandingBannerLogo = lazy(() => import("../../assets/LandingBanner"));

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [type, setType] = useState<string>("round_type_all");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [roundsInApplicationPhase, setRoundsInApplicationPhase] = useState<
    RoundOverview[]
  >([]);
  const [activeRounds, setActiveRounds] = useState<RoundOverview[]>([]);
  const [allActiveRounds, setAllActiveRounds] = useState<RoundOverview[]>([]);

  const [applyRoundsLoading, setApplyRoundsLoading] = useState<boolean>(true);
  const [activeRoundsLoading, setActiveRoundsLoading] = useState<boolean>(true);

  const debugModeEnabled = useDebugMode();

  useEffect(() => {
    if (type) {
      filterGrantRoundByType();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);
  
  const filterGrantRoundByType = () => {
    const getGrantRoundType = (type: string) => {
      return type === "round_type_direct"
        ? ROUND_PAYOUT_DIRECT
        : ROUND_PAYOUT_MERKLE;
    }
    if (type === "round_type_all") {
      setActiveRounds(allActiveRounds);
    }
    if (type !== "round_type_all") {
      const filterType = getGrantRoundType(type);
      const filteredRounds = allActiveRounds.filter((round: RoundOverview) => {
        return round.payoutStrategy && round.payoutStrategy.strategyName === filterType
      });
      setActiveRounds(filteredRounds);
      if (searchQuery) setSearchQuery("");
    }
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
      filterGrantRoundByType();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const filterProjectsByTitle = (query: string) => {
    // filter by exact title matches first
    // e.g if searchString is "ether" then "ether grant" comes before "ethereum grant"

    const exactMatches = activeRounds?.filter(
      (round) =>
        round.roundMetadata?.name?.toLocaleLowerCase() ===
        query.toLocaleLowerCase()
    );

    const nonExactMatches = activeRounds?.filter(
      (round) =>
        round.roundMetadata?.name
          ?.toLocaleLowerCase()
          .includes(query.toLocaleLowerCase()) &&
        round.roundMetadata?.name?.toLocaleLowerCase() !==
          query.toLocaleLowerCase()
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    setActiveRounds([...exactMatches!, ...nonExactMatches!]);
  };

  // Fetch active rounds
  useEffect(() => {
    const fetchActiveRounds = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isLoading, error, rounds } = await getActiveRounds(
          debugModeEnabled
        );
        setActiveRounds(rounds);
        setAllActiveRounds(rounds);
        setActiveRoundsLoading(isLoading);
      } catch (error) {
        setActiveRoundsLoading(false);
      }
    };
    fetchActiveRounds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch rounds in application phase
  useEffect(() => {
    const fetchRoundsInApplicationPhase = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isLoading, error, rounds } = await getRoundsInApplicationPhase(
          debugModeEnabled
        );
        setRoundsInApplicationPhase(rounds);
        setApplyRoundsLoading(isLoading);
      } catch (error) {
        setApplyRoundsLoading(false);
      }
    };
    fetchRoundsInApplicationPhase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Navbar roundUrlPath={"/"} showWalletInteraction={true} />
      <div className=" mx-auto pt-8">
        <main>
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
              setRoundType={setType}
              roundOverview={activeRounds}
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

export default LandingPage;
