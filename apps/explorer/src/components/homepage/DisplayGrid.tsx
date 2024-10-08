"use client";

import { RoundsQuery, useRounds } from "@allo-team/kit";
import Link from "next/link";
import RoundCard from "../round/RoundCard";

type Props = {
  query: RoundsQuery;
};

export default function DisplayGrid(props: Props) {
  const rounds = useRounds(props.query);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {rounds?.data?.map((object, i) => {
        return (
          <Link key={i} href={`/round/${object.chainId}/${object.id}`}>
            {/* <RoundCard
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
                        /> */}
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
