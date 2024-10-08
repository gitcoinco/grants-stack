"use client";

import { RoundCard, RoundsQuery, useRounds } from "@allo-team/kit";

type Props = {
  query: RoundsQuery;
};

export default function DisplayGrid(props: Props) {
  const rounds = useRounds(props.query);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {rounds?.data?.map((object, i) => {
        return (
          <RoundCard
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
          />
        );
      })}
    </div>
  );
}
