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
  const [searchQuery, setSearchQuery] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [roundsInApplicationPhase, setRoundsInApplicationPhase] = useState<
    RoundOverview[]
  >([]);
  const [activeRounds, setActiveRounds] = useState<RoundOverview[]>([]); // TODO: UPDTE
  const [applyRoundsLoading, setApplyRoundsLoading] = useState<boolean>(true);
  const [activeRoundsLoading, setActiveRoundsLoading] = useState<boolean>(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (searchQuery) {
      const timeOutId = setTimeout(
        () => filterProjectsByTitle(searchQuery),
        300
      );
      // TODO: Figure out how to how to handle this
      return () => clearTimeout(timeOutId);
    } else {
      setActiveRounds(activeRounds);
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const filterProjectsByTitle = (query: string) => {
    // filter by exact title matches first
    // e.g if searchString is "ether" then "ether grant" comes before "ethereum grant"
    // const exactMatches = activeRounds?.filter(
    //   (round) =>
    //   round.projectMetadata.title.toLocaleLowerCase() ===
    //     query.toLocaleLowerCase()
    // );
    // const nonExactMatches = projects?.filter(
    //   (project) =>
    //     project.projectMetadata.title
    //       .toLocaleLowerCase()
    //       .includes(query.toLocaleLowerCase()) &&
    //     project.projectMetadata.title.toLocaleLowerCase() !==
    //       query.toLocaleLowerCase()
    // );
    // // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    // setActiveRounds([...exactMatches!, ...nonExactMatches!]);
  };

  // Fetch active rounds
  useEffect(() => {
    const fetchActiveRounds = async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { isLoading, error, rounds } = await getActiveRounds();
      setActiveRounds(rounds);
      setActiveRoundsLoading(isLoading);
    };
    fetchActiveRounds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch rounds in application phase
  useEffect(() => {
    const fetchRoundsInApplicationPhase = async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { isLoading, error, rounds } = await getRoundsInApplicationPhase();
      setRoundsInApplicationPhase(rounds);
      setApplyRoundsLoading(isLoading);
    };
    fetchRoundsInApplicationPhase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Navbar roundUrlPath={"/"} showWalletInteraction={false} />
      <LandingBannerLogo className="w-full h-auto object-cover rounded-t" />
      <div className="container px-4 md:px-0 md:mx-auto">
        <h1 className="text-3xl mt-11 mb-5 border-b-2 pb-4">
          Browse through active rounds
        </h1>
        <ApplyNowSection isLoading={applyRoundsLoading} roundOverview={roundsInApplicationPhase} />
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
