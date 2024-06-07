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
  <BasicCard className="program-card border-none m-2 mb-6 min-w-[350px] sm:min-w-[375px] md:min-w-[400px] lg:min-w-[400px] xl:min-w-[350px] relative rounded-lg">
    <CardContent className="p-4 px-5">
      <CardTitle className="font-medium text-2xl font-sans">
        {props.title}
      </CardTitle>
      <CardDescription className="line-clamp-none text-gray-500">
        <div className="flex items-center">
          <UserGroupIcon className="h-4 w-4 inline mr-2" />
          <span>{props.description}</span>
        </div>
        <div className="flex flex-col mt-6">
          {/* todo: Add badges to props for each round category that exists within the program */}
          {props.strategyType === "quadratic" ? (
            <div className="my-1">
              <span className="border border-green-100 rounded-2xl bg-green-100 p-1 px-2 font-mono">
                Quadratic funding
              </span>
            </div>
          ) : (
            <div className="my-1">
              <span className="border border-yellow-100 rounded-2xl bg-yellow-100 p-1 px-2 font-mono">
                Direct Grants
              </span>
            </div>
          )}
        </div>
      </CardDescription>
    </CardContent>
    <CardFooter>
      <CardFooterContent className="p-6 bg-gray-100 rounded-b-xl">
        {props.footerContent}
      </CardFooterContent>
    </CardFooter>
  </BasicCard>
);
