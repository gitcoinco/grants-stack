import { useEffect, useState } from "react";
import { ReactComponent as LandingBannerLogo } from "../../assets/landing-banner.svg";
import {
  RoundOverview,
  getActiveRounds,
  getRoundsInApplicationPhase,
} from "../api/rounds";
import Navbar from "../common/Navbar";
import ActiveRoundsSection from "./ActiveRoundSection";
import ApplyNowSection from "./ApplyNowSection";

const LandingPage = () => {
  window.location.replace("https://grants.gitcoin.co");

  const [searchQuery, setSearchQuery] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [roundsInApplicationPhase, setRoundsInApplicationPhase] = useState<
    RoundOverview[]
  >([]);
  const [activeRounds, setActiveRounds] = useState<RoundOverview[]>([]);
  const [applyRoundsLoading, setApplyRoundsLoading] = useState<boolean>(true);
  const [activeRoundsLoading, setActiveRoundsLoading] = useState<boolean>(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (searchQuery) {
      const timeOutId = setTimeout(
        () => filterProjectsByTitle(searchQuery),
        300
      );
      return () => clearTimeout(timeOutId);
    } else {
      setActiveRounds(activeRounds);
    }
  });

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
        const { isLoading, error, rounds } = await getActiveRounds();
        setActiveRounds(rounds);
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
        const { isLoading, error, rounds } =
          await getRoundsInApplicationPhase();
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
      <Navbar roundUrlPath={"/"} showWalletInteraction={false} />
      <LandingBannerLogo className="w-full h-auto object-cover rounded-t" />
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
          roundOverview={activeRounds}
          searchQuery={searchQuery}
        />
      </div>
    </>
  );
};

export default LandingPage;
