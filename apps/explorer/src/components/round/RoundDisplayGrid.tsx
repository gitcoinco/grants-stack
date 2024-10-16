"use client";

import React from "react";
// import { RoundsQuery, useRounds } from "@allo-team/kit";
import { RoundsQuery } from "@allo-team/kit";
import Link from "next/link";
import RoundCard from "../round/RoundCard";
import { useRounds } from "@/hooks/rounds/useRounds";
import { activeRounds } from "@/domains/rounds/QueryFilters";

type Props = {
  query: RoundsQuery;
};

export default function RoundDisplayGrid(props: Props) {
  const {
    data: rounds,
    isPending: isRoundsLoading,
    isError: isRoundError,
  } = useRounds(activeRounds());

  // const rounds2 = useRounds

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div>{JSON.stringify(isRoundsLoading)}</div>
      {/* <div>{JSON.stringify(rounds)}</div> */}
      {rounds?.map((object, i) => {
        return (
          <Link key={i} href={`/round/${object.chainId}/${object.id}`}>
            <RoundCard
              title={object.name}
              description={object.description}
              type={object.strategy}
            />
          </Link>
        );
      })}
    </div>
  );
}

{
  /* <RoundCard
                            key={i}
                            strategy={object.strategy}
                            id={object.id}
                            name={object.name}
                            description={object.description}
                            eligibility={object.eligibility}
                            chainId={object.chainId}
                            matching={object.matching}
                            roles={object.roles}
                            phases={object.phases}
                            // bannerUrl={object.bannerUrl}
                        />  */
}
