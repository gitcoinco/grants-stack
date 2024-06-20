import { UserGroupIcon } from "@heroicons/react/solid";
import {
  BasicCard,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
  CardFooterContent,
} from "../common/styles";
import { CardProps } from "../common/types";

export const ProgramCard: React.FC<CardProps> = (props: CardProps) => (
  <BasicCard className="program-card border-none gap-4 min-w-[350px] sm:min-w-[375px] md:min-w-[400px] lg:min-w-[400px] xl:min-w-[200px] 2xl:min-w-[340px] relative rounded-lg mr-auto">
    <CardContent className="p-4 px-5">
      <CardTitle className="font-medium text-2xl font-sans">
        {props.title}
      </CardTitle>
      <CardDescription className="line-clamp-none text-grey-500">
        <div className="flex items-center">
          <UserGroupIcon className="h-4 w-4 inline mr-2" />
          <span>{props.description}</span>
        </div>
        <div className="flex flex-col mt-6">
          {props.qfRoundsCount != 0 && (
            <div className="my-1">
              <span className="gradient-border-qf p-1 px-2 font-mono">
                {props.qfRoundsCount} Quadratic funding
              </span>
            </div>
          )}
          {props.dgRoundsCount != 0 && (
            <div className="my-1">
              <span className="gradient-border-direct rounded-2xl p-1 px-2 font-mono">
                {props.dgRoundsCount} Direct Grants
              </span>
            </div>
          )}
        </div>
      </CardDescription>
    </CardContent>
    <CardFooter>
      <CardFooterContent className="p-6 bg-grey-100 rounded-b-xl">
        {props.footerContent}
      </CardFooterContent>
    </CardFooter>
  </BasicCard>
);
