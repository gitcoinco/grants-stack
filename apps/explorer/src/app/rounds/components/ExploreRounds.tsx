"use client";

import { bigIntReplacer, getRoundTime } from "@/utils/utils";
import {
  Avatar,
  BackgroundImage,
  Badge,
  Card,
  CardContent,
  cn,
  Grid,
  RoundCard,
  RoundsQuery,
  RoundStrategyBadge,
  Separator,
  TokenAmount,
  useRounds,
} from "@allo-team/kit";

type Props = {
  chainId?: number;
  roundId?: string;
  applicationId?: string;
  query: RoundsQuery;
};

export default function ExploreRounds(props: Props) {
  const rounds = useRounds(props.query);

  return (
    <section className="px-2 py-20 md:px-8">
      <div className="border border-white border-dashed ">
        <div className="p-4 text-2xl">Explore Rounds</div>

        {/* <div>{JSON.stringify(rounds, bigIntReplacer)}</div> */}

        {/* <Grid component={RoundCard} data={rounds?.data} /> */}

        <div className="grid grid-cols-1 gap-8 px-8 pt-8 pb-24">
          {rounds?.data?.map((object, i) => {
            return (
              <Card
                key={i}
                className={cn(
                  "relative overflow-hidden rounded-3xl shadow-xl",
                  {
                    //   ["animate-pulse"]: isLoading,
                  }
                )}
              >
                <div className="">
                  <BackgroundImage
                    className="h-32 bg-gray-800"
                    src={object.bannerUrl}
                  />
                  <h3 className="pl-1 -mt-8 text-2xl font-medium text-gray-100 truncate">
                    {object.name}
                  </h3>
                </div>
                <CardContent className="p-4 space-y-2">
                  <p className="h-24 text-base leading-6 line-clamp-4">
                    {object.description}
                  </p>
                  <div className="flex items-center justify-between flex-1 text-xs">
                    <div className="w-1/2 font-mono truncate">
                      {getRoundTime(object.phases)}
                    </div>
                    <div className="flex justify-end w-1/2">
                      <RoundStrategyBadge strategyName={object.strategyName} />
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <div className="">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex gap-2">
                          {object.applications && (
                            <Badge variant={"secondary"}>
                              {object.applications?.length} projects
                            </Badge>
                          )}
                          {object.matching && (
                            <Badge variant={"secondary"}>
                              <TokenAmount {...object.matching} />
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Avatar className="size-8">
                        {/* <div
                                      className="size-8"
                                      dangerouslySetInnerHTML={{ __html: network?.icon! }}
                                    /> */}
                      </Avatar>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
