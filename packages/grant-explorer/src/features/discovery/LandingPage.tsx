import { Round } from "../api/types";
import RoundCard from "./RoundCard";

const mockRoundData: Round = {
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
};

console.log("mockRoundData", mockRoundData);

const LandingPage = () => {
  return (
    <div className="">
      {/* <LandingHeader /> */}
      <TitleSection />
      <hr className="text-grey-100 mx-4 my-8" />
      <div>
        <ApplyNowSection />
      </div>
      <div>
        <AllActviveRoundsSection />
      </div>
    </div>
  );
};

const TitleSection = () => {
  return (
    <div className="mt-96">
      <span className="text-[30px] text-grey-500 mx-4">
        Browse through active rounds
      </span>
    </div>
  );
};

const ApplyNowSection = () => {
  return (
    <div className="mx-4">
      <div>
        <span className="text-grey-400 text-[24px]">Apply Now</span>
        <div className="flex items-center justify-between">
          <span className="text-grey-400">
            Rounds currently accepting applications
          </span>
          <a className="cursor-pointerß" href="/">
            View All (10)
          </a>
        </div>
      </div>
      <div className="flex justify-between items-center p-2 m-2">
        <RoundCard round={mockRoundData} />
        <RoundCard round={mockRoundData} />
        <RoundCard round={mockRoundData} />
      </div>
    </div>
  );
};

const AllActviveRoundsSection = () => {
  return (
    <div className="mx-4">
      <span className="text-grey-400 text-[24px]">
        All Active Rounds<span> (20)</span>
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

      <div className="flex justify-between items-center">
        <RoundCard round={mockRoundData} />
        <RoundCard round={mockRoundData} />
        <RoundCard round={mockRoundData} />
        <RoundCard round={mockRoundData} />
        <RoundCard round={mockRoundData} />
        <RoundCard round={mockRoundData} />
        <RoundCard round={mockRoundData} />
        <RoundCard round={mockRoundData} />
        <RoundCard round={mockRoundData} />
      </div>
    </div>
  );
};

export default LandingPage;
