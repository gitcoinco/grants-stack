import { Round } from "../api/types";
import RoundCard from "./RoundCard";

const mockRoundData: Round[] = [
  {
    id: "0x1234",
    roundMetadata: undefined,
    store: undefined,
    applicationStore: undefined,
    votingStrategy: "",
    roundStartTime: new Date(),
    roundEndTime: new Date(),
    applicationsStartTime: new Date(),
    applicationsEndTime: new Date(),
    token: "",
    ownedBy: "",
    approvedProjects: [],
  },
  {
    id: "0x1235",
    roundMetadata: undefined,
    store: undefined,
    applicationStore: undefined,
    votingStrategy: "",
    roundStartTime: new Date(),
    roundEndTime: new Date(),
    applicationsStartTime: new Date(),
    applicationsEndTime: new Date(),
    token: "",
    ownedBy: "",
    approvedProjects: [],
  },
];

console.log("mockRoundData", mockRoundData);

const LandingPage = () => {
  // todo: fetch all the round data from the indexer
  // todo: sort the rounds by application period and then by voting period

  const roundData = mockRoundData;
  return (
    <div className="">
      {/* <LandingHeader /> */}
      <TitleSection />
      <hr className="text-grey-100 mx-4 my-8" />
      <div>
        <ApplyNowSection roundData={roundData} />
      </div>
      <div>
        <AllActviveRoundsSection roundData={roundData} />
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
const ApplyNowSection = (props: { roundData: Round[] }) => {
  return (
    <div className="mx-4">
      <div>
        <span className="text-grey-400 md:text-[24] text-[20px]">
          Apply Now
        </span>
        <div className="flex flex-row items-center justify-between">
          <span className="text-grey-400">
            Rounds currently accepting applications
          </span>
          <a className="cursor-pointer mr-1" href="/">
            View All ({props.roundData.length.toString()})
          </a>
        </div>
      </div>
      <div className="flex lg:flex-row md:flex-row sm:flex-row flex-col justify-between items-center">
        {props.roundData.map((round) => {
          return <RoundCard round={round} />;
        })}
      </div>
    </div>
  );
};

const AllActviveRoundsSection = (props: { roundData: Round[] }) => {
  return (
    <div className="mx-4">
      <span className="text-grey-400 text-[24px]">
        All Active Rounds<span> ({props.roundData.length.toString()})</span>
      </span>
      <div className="flex justify-between items-center mb-1">
        <div className="flex">
          <span className="text-grey-400">Rounds that are ongoing</span>
        </div>
        <div className="">
          <div className="">
            <input className="rounded mx-2" type="search" />
            <span className="">Sort by</span>
            <select
              className="border-0 cursor-pointer"
              placeholder="Select Filter"
            >
              <option>Round End (Earliest)</option>
              <option>Round Start (Earliest)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex lg:flex-row md:flex-row flex-col justify-between items-center">
        {props.roundData.map((round) => {
          return <RoundCard round={round} />;
        })}
        {/* todo: added for layout purposes, remove after */}
        <RoundCard round={mockRoundData[0]} />
        <RoundCard round={mockRoundData[0]} />
        <RoundCard round={mockRoundData[0]} />
        <RoundCard round={mockRoundData[0]} />
        <RoundCard round={mockRoundData[0]} />
        <RoundCard round={mockRoundData[0]} />
      </div>
    </div>
  );
};

export default LandingPage;
