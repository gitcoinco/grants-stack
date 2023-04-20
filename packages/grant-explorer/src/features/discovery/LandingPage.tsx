import { ReactComponent as LandingBannerLogo } from "../../assets/landing-banner.svg";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import RoundCard from "./RoundCard";
import Navbar from "../common/Navbar";
import { ReactComponent as Search } from "../../assets/search-grey.svg";
import { Input } from "common/src/styles";


// import { RoundOverview } from "../api/rounds";

const mockRoundData: any[] = [
  {
    id: "0x2ffe6a9176349d8ac2f1d1ed2035cc4e48c4efdc",
    roundMetaPtr: {
      protocol: 1,
      pointer: "bafkreia6rhfcnpclbgodphfj5u3sd4cj3w2rkw4tewzox7mcic2ucydxha",
    },
    applicationMetaPtr: {
      protocol: 1,
      pointer: "bafkreihvaiu2duyijp2se3lorvqruqun3gniwzdx3imwhfaft4pfigmgi4",
    },
    applicationsStartTime: "1681812000",
    applicationsEndTime: "1682380800",
    roundStartTime: "1682467200",
    roundEndTime: "1682812800",
    matchAmount: "10000000000000000000",
    token: "0x0000000000000000000000000000000000000000",
  },
  {
    id: "0x3d3f053e6b0e337a5d536ded49b41044ea41325a",
    roundMetaPtr: {
      protocol: 1,
      pointer: "bafkreiarezofvxzfghevjdj6ch7zgbcqeb3ff5ikrf7kcaqjlyw6vv3blu",
    },
    applicationMetaPtr: {
      protocol: 1,
      pointer: "bafkreih3tt7nud7pobaveca3frnjx4vpotuoi5kqmjuuvjxkaxuq7cy5qy",
    },
    applicationsStartTime: "1681149600",
    applicationsEndTime: "1682640000",
    roundStartTime: "1682726400",
    roundEndTime: "1688515200",
    matchAmount: "1000000000000000000",
    token: "0x0000000000000000000000000000000000000000",
  },
  {
    id: "0x4bbd7baa41d38952dd1c16c08759947d9d86723b",
    roundMetaPtr: {
      protocol: 1,
      pointer: "bafkreiayjt4t3gf3smsmv7h7dsbwjrajeys3rnwl3znhcdcd2ex53fy2ku",
    },
    applicationMetaPtr: {
      protocol: 1,
      pointer: "bafkreib74i7kcvswn4lh3sgv756siswtpgwz3czafkklsewjcsyf32hxfa",
    },
    applicationsStartTime: "1680864300",
    applicationsEndTime: "1703894400",
    roundStartTime: "1703980800",
    roundEndTime: "1714435200",
    matchAmount: "10000000000000000",
    token: "0x0000000000000000000000000000000000000000",
  },
  {
    id: "0xa2eb29ab42629f47fd98e3f4b595a5aa79f004fb",
    roundMetaPtr: {
      protocol: 1,
      pointer: "bafkreidbg4dzwwtlo7foyboq3qgfotpmiheyldueiqb5ou4idnyr3f36lu",
    },
    applicationMetaPtr: {
      protocol: 1,
      pointer: "bafkreickg52gaujti7t4aqhqov76j4cvpizic3nyq54umt4kkljvcudafu",
    },
    applicationsStartTime: "1680865200",
    applicationsEndTime: "1703980800",
    roundStartTime: "1704067200",
    roundEndTime: "1722384000",
    matchAmount: "10000000000000000",
    token: "0x0000000000000000000000000000000000000000",
  },
  {
    id: "0xbfb1aba5c8efff130ac5c12f325726684fe701af",
    roundMetaPtr: {
      protocol: 1,
      pointer: "bafkreiayh5ju4dlwvuiqnkq2vhqvai3ew3abqviotideb3dbfhdxecocwe",
    },
    applicationMetaPtr: {
      protocol: 1,
      pointer: "bafkreifhrqrpo2a6z3vmi7gx5y4kelbdf54tt5jqikamsinwddlymz42be",
    },
    applicationsStartTime: "1681754400",
    applicationsEndTime: "1685491200",
    roundStartTime: "1685577600",
    roundEndTime: "1692576000",
    matchAmount: "10000000000000000000000",
    token: "0x11fe4b6ae13d2a6055c8d9cf65c55bac32b5d844",
  },
];

console.log("mockRoundData", mockRoundData);

const LandingPage = () => {

  const [searchQuery, setSearchQuery] = useState("");
  const [activeRounds, setActiveRounds] = useState<any[]>(); // TODO: UPDTE

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (searchQuery) {
      const timeOutId = setTimeout(
        () => filterProjectsByTitle(searchQuery),
        300
      );
      return () => clearTimeout(timeOutId);
    } else {
      const rounds = mockRoundData; // TODO : Update
      setActiveRounds(rounds);
    }
  });


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

  const { address } = useAccount();
  // todo: fetch all the round data from the indexer
  // const [roundData, setRoundData] = useState<RoundOverview[]>([]);

  useEffect(() => {
    const fetchRounds = async () => {
      // const roundsForChain = await getRoundsInApplicationPhase();
      // setRoundData(roundsForChain);
    };

    fetchRounds();
  }, [address]);
  // todo: sort the rounds by application period and then by voting period

  const SearchInput = () => {
    return(
      <div className="relative">
        <Search className="absolute h-4 w-4 mt-3 ml-3" />
        <Input
          className="w-full lg:w-64 h-8 rounded-full pl-10"
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    )
  }

  const SortFilter = () => {
    return(
      <div>
        <span className="ml-8">Sort by</span>
          <select
            className="border-0 cursor-pointer text-violet-400 underline"
            placeholder="Select Filter"
          >
            <option>Round End (Earliest)</option>
            <option>Round Start (Earliest)</option>
          </select>
      </div>
    )
  };

  const ApplyNowSection = (props: { roundData: any[] }) => {
    return (
      <div>
        <div>
          <span className="text-grey-400 text-2xl">
            Apply Now
          </span>
          <div className="flex flex-row items-center justify-between">
            <span className="text-grey-400 mb-4 mt-2">
              Rounds currently accepting applications
            </span>
            <a className="cursor-pointer mr-1 text-violet-400 text-sm" href="/">
              View All ( {props.roundData.length.toString()} )
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 md:gap-6">
          {props.roundData.map((round, index) => {
            return <RoundCard key={index} round={round} />;
          })}
        </div>
      </div>
    );
  };

  const ActiveRoundsSection = (props: { roundData: any[] }) => {
    return (
      <div className="my-6">
        <div className="flex justify-between items-center mb-1">
          <div className="flex flex-col my-4">
            <span className="text-grey-400 text-2xl">
              All Active Rounds
              ({props.roundData.length.toString()})
            </span>
            <span className="text-grey-400 text-sm mb-4 mt-2">
              Rounds that are ongoing
            </span>
          </div>

          <div className="flex">
            <SearchInput />
            <SortFilter />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 md:gap-6">
          {props.roundData.map((round, index) => {
            return <RoundCard key={index} round={round} />;
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar roundUrlPath={"/"} hideWalletInteraction={true}/>

      <LandingBannerLogo className="w-full object-cover rounded-t" />

      <div className="container mx-auto">

        <h1 className="text-3xl mt-11 mb-5 border-b-2 pb-4">Browse through active rounds</h1>

        <ApplyNowSection roundData={mockRoundData} />

        <ActiveRoundsSection roundData={mockRoundData} />
      </div>
    </>
  );

}
export default LandingPage;
