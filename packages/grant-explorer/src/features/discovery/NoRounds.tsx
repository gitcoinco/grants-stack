type NoRoundsProps = {
  type: "apply" | "active";
};

const NoRounds = (props: NoRoundsProps) => {
  switch (props.type) {
    case "apply":
      return (
        <div className="flex flex-col items-center justify-center h-full mt-4 mb-10">
          <p className="text-grey-400 text-sm">
            No rounds are currently accepting applications.
          </p>
          <p className="text-grey-400 text-sm mt-2">
            Stay tuned on{" "}
            <a
              className="text-violet-400"
              href="https://twitter.com/gitcoin"
              target="_blank"
            >
              Gitcoin Twitter
            </a>{" "}
            for the latest news and updates!
          </p>
        </div>
      );
    case "active":
      return (
        <div className="flex flex-col items-center justify-center h-full mt-4 mb-10">
          <p className="text-grey-400 text-sm">
            No rounds are currently ongoing.
          </p>
          <p className="text-grey-400 text-sm mt-2">
            Stay tuned on{" "}
            <a
              className="text-violet-400"
              href="https://twitter.com/gitcoin"
              target="_blank"
            >
              Gitcoin Twitter
            </a>{" "}
            for the latest news and updates!
          </p>
        </div>
      );
  }
};

export default NoRounds;
