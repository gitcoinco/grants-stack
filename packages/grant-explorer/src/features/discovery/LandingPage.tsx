/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { FiSearch } from 'react-icons/fi';
import { useAccount } from "wagmi";
import RoundCard from "./RoundCard";
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

  console.log("Landing Page => ", { address });

  return (
    <div className="">
      {/* <LandingHeader /> */}
      <TitleSection />
      <hr className="text-grey-100 mx-4 my-8" />
      <div>
        <ApplyNowSection roundData={mockRoundData} />
      </div>
      <div>
        <AllActviveRoundsSection roundData={mockRoundData} />
      </div>
    </div>
  );
};

const TitleSection = () => {
  return (
    <div className="mt-96">
      <span className="md:text-[30px] text-[24px] text-grey-500 mx-4">
        Browse through active rounds
      </span>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ApplyNowSection = (props: { roundData: any[] }) => {
  return (
    <div className="mx-4">
      <div>
        <span className="text-grey-400 md:text-[24] text-[20px]">
          Apply Now
        </span>
        <div className="flex flex-row items-center justify-between">
          <span className="text-grey-400 mb-4 mt-2">
            Rounds currently accepting applications
          </span>
          <a className="cursor-pointer mr-1 text-violet-400 underline" href="/">
            View All ({props.roundData.length.toString()})
          </a>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2">
        {props.roundData.map((round, index) => {
          return <RoundCard key={index} round={round} />;
        })}
      </div>
    </div>
  );
};

// todo: finish the onclick event handler
const SearchInput = () => {
  return (
    <div className="relative w-64">
      <input
        type="search"
        placeholder="Search..."
        className="border border-gray-400 rounded-md pl-10 pr-4 py-2 w-full focus:outline-none focus:border-violet-500"
      />
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
  )
}

const AllActviveRoundsSection = (props: { roundData: any[] }) => {
  return (
    <div className="mx-4 my-6">
      <div className="flex justify-between items-center mb-1">
        <div className="flex flex-col my-4">
          <span className="text-grey-400 md:text-[24] text-[20px]">
            All Active Rounds<span> ({props.roundData.length.toString()})</span>
          </span>
          <span className="text-grey-400 mb-4 mt-2">Rounds that are ongoing</span>
        </div>

        {/* todo: search/sort feature */}
        <div>
          <div className="flex items-center justify-between">
            {/* <SearchInput /> */}
            <span className="ml-8">Sort by</span>
            <select
              className="border-0 cursor-pointer text-violet-400 underline"
              placeholder="Select Filter"
            >
              <option>Round End (Earliest)</option>
              <option>Round Start (Earliest)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2">
        {props.roundData.map((round, index) => {
          return <RoundCard key={index} round={round} />;
        })}
      </div>
    </div>
  );
};

export default LandingPage;
