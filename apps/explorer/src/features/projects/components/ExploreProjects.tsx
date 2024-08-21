"use client";

import { bigIntReplacer } from "@/utils/utils";
import { RoundsQuery, useRounds } from "@allo-team/kit";

type Props = {
  chainId: number;
  roundId: string;
  applicationId: string;
};

export default function ExploreProjects(props: Props) {
  const query: RoundsQuery = {
    where: { chainId: { equalTo: props.chainId } },
    orderBy: { match_amount_in_usd: "desc" },
    first: 10,
  };

  const rounds = useRounds(query);

  return (
    <section className="px-8 py-20 md:px-16">
      <div className="border border-white border-dashed ">
        <div>
          {props.applicationId} and {props.chainId} and {props.roundId}
        </div>
        <div className="p-4 text-2xl">Explore Projects</div>

        {/* <div>{JSON.stringify(rounds, bigIntReplacer)}</div> */}

        <div className="grid grid-cols-1 gap-8 px-8 pt-8 pb-24">
          {rounds?.data?.map((object, i) => {
            // {Array.from({ length: rounds.data ? rounds.data.length : 0 }).map((object, i) => {

            return (
              <div className="p-12 border-2 border-orange-200" key={i}>
                {/* {rounds.data ? rounds.data[i].id : 'No data'} */}
                {JSON.stringify(object, bigIntReplacer)}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
